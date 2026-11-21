import { Router } from 'express';
import { z } from 'zod';
import type { AppConfig } from '../config/env.js';
import { authenticationMiddleware } from '../core/authentication/authentication-middleware.js';
import { requirePermission } from '../core/authorization/permission-middleware.js';
import { GenericCrudService } from '../core/crud/generic-crud.service.js';
import { metadataModelRegistry } from '../core/crud/metadata-model-registry.js';
import { AppError } from '../core/errors/app-error.js';
import { metadataRegistry } from '../core/metadata/registry/index.js';
import { tenantScopeMiddleware } from '../core/tenancy/tenant-scope-middleware.js';

const promotionSchema = z.object({
  studentId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  classId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  sectionId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  academicSessionId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

const attendanceSchema = z.object({
  date: z.string().date(),
  records: z
    .array(
      z.object({
        studentId: z.string().regex(/^[0-9a-fA-F]{24}$/),
        classId: z.string().regex(/^[0-9a-fA-F]{24}$/),
        sectionId: z.string().regex(/^[0-9a-fA-F]{24}$/),
        status: z.enum(['present', 'absent', 'late', 'excused']),
        remarks: z.string().max(1000).optional(),
      }),
    )
    .min(1)
    .max(500),
});

const feePaymentSchema = z.object({
  studentId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  amount: z.number().positive(),
  paymentDate: z.string().datetime(),
  paymentMethod: z.enum(['cash', 'bank', 'card', 'upi', 'cheque']),
  referenceNumber: z.string().trim().min(1).max(100).optional(),
});

export function createDomainWorkflowRouter(
  config: Pick<
    AppConfig,
    | 'JWT_ACCESS_SECRET'
    | 'JWT_REFRESH_SECRET'
    | 'JWT_ACCESS_EXPIRY'
    | 'JWT_REFRESH_EXPIRY'
  >,
) {
  const router = Router();
  const authenticate = authenticationMiddleware(config);
  const crud = new GenericCrudService();
  router.use(authenticate, tenantScopeMiddleware);

  router.post(
    '/student-promotions',
    requirePermission('students.update'),
    async (request, response, next) => {
      try {
        const input = promotionSchema.parse(request.body);
        const metadata = metadataRegistry.getByEntityCode('students');
        if (!metadata)
          throw new AppError('Students metadata is unavailable', 500);
        const model = metadataModelRegistry.get('students');
        if (!model) throw new AppError('Students model is unavailable', 500);
        const context = request.tenantContext!;
        if (!context.tenantId)
          throw new AppError('Tenant context is required', 403);

        const student = await model
          .findOneAndUpdate(
            {
              _id: input.studentId,
              tenantId: context.tenantId,
              deletedAt: null,
            },
            {
              $set: {
                classId: input.classId,
                sectionId: input.sectionId,
                academicSessionId: input.academicSessionId,
              },
            },
            { new: true, runValidators: true },
          )
          .lean();
        if (!student) throw new AppError('Student not found', 404);
        response.json({
          success: true,
          data: student,
          message: 'Student promoted',
        });
      } catch (error) {
        next(error);
      }
    },
  );

  router.post(
    '/attendance/student',
    requirePermission('studentAttendance.create'),
    async (request, response, next) => {
      try {
        const input = attendanceSchema.parse(request.body);
        const metadata = metadataRegistry.getByEntityCode('studentAttendance');
        if (!metadata)
          throw new AppError('Attendance metadata is unavailable', 500);
        const academicSessionId =
          request.tenantContext?.academicSessionId?.toString();
        const records = await Promise.all(
          input.records.map((record) =>
            crud.create(
              metadata,
              {
                ...record,
                date: input.date,
                ...(academicSessionId ? { academicSessionId } : {}),
              },
              request.tenantContext!,
            ),
          ),
        );
        response.status(201).json({
          success: true,
          data: records,
          meta: { totalRecords: records.length },
          message: 'Student attendance recorded',
        });
      } catch (error) {
        next(error);
      }
    },
  );

  router.post(
    '/examinations/:id/publish',
    requirePermission('results.publish'),
    async (request, response, next) => {
      try {
        const examination = metadataModelRegistry.get('examinations');
        const results = metadataModelRegistry.get('results');
        if (!examination || !results)
          throw new AppError('Examination models are unavailable', 500);
        const context = request.tenantContext!;
        if (!context.tenantId)
          throw new AppError('Tenant context is required', 403);
        const filter = {
          _id: request.params.id,
          tenantId: context.tenantId,
          deletedAt: null,
        };
        const published = await examination
          .findOneAndUpdate(
            filter,
            { $set: { status: 'published' } },
            { new: true },
          )
          .lean();
        if (!published) throw new AppError('Examination not found', 404);
        await results.updateMany(
          {
            examId: request.params.id,
            tenantId: context.tenantId,
            deletedAt: null,
          },
          { $set: { status: 'published' } },
        );
        response.json({
          success: true,
          data: published,
          message: 'Examination results published',
        });
      } catch (error) {
        next(error);
      }
    },
  );

  router.post(
    '/fees/payments',
    requirePermission('feePayments.create'),
    async (request, response, next) => {
      try {
        const input = feePaymentSchema.parse(request.body);
        const metadata = metadataRegistry.getByEntityCode('feePayments');
        if (!metadata)
          throw new AppError('Fee payment metadata is unavailable', 500);
        const payment = await crud.create(
          metadata,
          input as Record<string, unknown>,
          request.tenantContext!,
        );
        response.status(201).json({
          success: true,
          data: payment,
          message: 'Fee payment recorded',
        });
      } catch (error) {
        next(error);
      }
    },
  );

  router.post(
    '/payroll/runs/:id/process',
    requirePermission('payrollRuns.update'),
    async (request, response, next) => {
      try {
        const payroll = metadataModelRegistry.get('payrollRuns');
        const entries = metadataModelRegistry.get('payrollEntries');
        if (!payroll || !entries)
          throw new AppError('Payroll models are unavailable', 500);
        const context = request.tenantContext!;
        if (!context.tenantId)
          throw new AppError('Tenant context is required', 403);
        const run = await payroll
          .findOneAndUpdate(
            {
              _id: request.params.id,
              tenantId: context.tenantId,
              deletedAt: null,
            },
            { $set: { status: 'processing' } },
            { new: true },
          )
          .lean();
        if (!run) throw new AppError('Payroll run not found', 404);
        await entries.updateMany(
          {
            payrollRunId: request.params.id,
            tenantId: context.tenantId,
            deletedAt: null,
          },
          { $set: { status: 'completed' } },
        );
        await payroll.updateOne(
          {
            _id: request.params.id,
            tenantId: context.tenantId,
            deletedAt: null,
          },
          { $set: { status: 'completed' } },
        );
        response.json({
          success: true,
          data: { id: request.params.id, status: 'completed' },
          message: 'Payroll run processed',
        });
      } catch (error) {
        next(error);
      }
    },
  );

  router.post(
    '/notifications/send',
    requirePermission('notifications.create'),
    async (request, response, next) => {
      try {
        const schema = z.object({
          recipientId: z.string().regex(/^[0-9a-fA-F]{24}$/),
          channel: z.enum(['email', 'sms', 'whatsapp', 'push', 'in-app']),
          subject: z.string().max(200).optional(),
          body: z.string().trim().min(1).max(10000),
        });
        const input = schema.parse(request.body);
        const metadata = metadataRegistry.getByEntityCode('notifications');
        if (!metadata)
          throw new AppError('Notification metadata is unavailable', 500);
        const notification = await crud.create(
          metadata,
          { ...input, status: 'queued' },
          request.tenantContext!,
        );
        response.status(201).json({
          success: true,
          data: notification,
          message: 'Notification queued',
        });
      } catch (error) {
        next(error);
      }
    },
  );

  router.post(
    '/documents/generate',
    requirePermission('documentGenerationJobs.create'),
    async (request, response, next) => {
      try {
        const input = z
          .object({
            templateId: z.string().regex(/^[0-9a-fA-F]{24}$/),
            documentType: z.string().trim().min(1).max(100),
          })
          .parse(request.body);
        const metadata = metadataRegistry.getByEntityCode(
          'documentGenerationJobs',
        );
        if (!metadata)
          throw new AppError('Document metadata is unavailable', 500);
        const job = await crud.create(
          metadata,
          { ...input, status: 'queued' },
          request.tenantContext!,
        );
        response.status(201).json({
          success: true,
          data: job,
          message: 'Document generation queued',
        });
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}
