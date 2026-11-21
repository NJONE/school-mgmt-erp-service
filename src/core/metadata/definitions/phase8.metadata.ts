import { baseEntity, field } from './helpers.js';
import type { EntityMetadata } from '../interfaces/metadata.js';

function entity(
  entity: string,
  title: string,
  module: string,
  fields: EntityMetadata['fields'][number][],
): EntityMetadata {
  const tableColumns = fields
    .filter((item) =>
      [
        'name',
        'title',
        'code',
        'status',
        'channel',
        'type',
        'format',
        'scheduledAt',
        'recipientCount',
        'documentType',
        'reportType',
      ].includes(item.key),
    )
    .map((item) => item.key);
  if (tableColumns.length === 0) {
    tableColumns.push(
      ...fields
        .filter((item) => item.key !== 'id')
        .slice(0, 3)
        .map((item) => item.key),
    );
  }
  return baseEntity({
    entity,
    title,
    pluralTitle: `${title}s`,
    description: `${title} configuration or transactional record for platform communications and reporting.`,
    module,
    entityType: [
      'subscriptionPlans',
      'reportDefinitions',
      'notificationTemplates',
      'documentTemplates',
    ].includes(entity)
      ? 'master'
      : 'transaction',
    scopes: {
      schoolScoped: [
        'announcements',
        'notifications',
        'documentGenerationJobs',
      ].includes(entity),
      branchScoped: false,
      academicSessionScoped: false,
    },
    fields,
    tabs: [
      {
        title: 'Details',
        sections: [
          {
            title: 'Record',
            columns: 2,
            fields: fields
              .filter(
                (item) =>
                  !['id', 'tenantId', 'createdAt', 'updatedAt'].includes(
                    item.key,
                  ),
              )
              .map((item) => ({ field: item.key })),
          },
        ],
      },
    ],
    columns: tableColumns,
    filters: fields.filter((item) => item.filterable).map((item) => item.key),
    searchFields: fields
      .filter((item) => item.searchable)
      .map((item) => item.key),
    displayField:
      fields.find((item) => item.searchable)?.key ??
      fields.find((item) => item.key !== 'id')?.key ??
      'id',
  });
}

export const phase8Metadata: EntityMetadata[] = [
  entity('announcements', 'Announcement', 'communications', [
    field('id', 'Announcement ID', 'readonly', {
      readonly: true,
      visibleInForm: false,
    }),
    field('tenantId', 'Tenant', 'reference', {
      readonly: true,
      visibleInForm: false,
    }),
    field('schoolId', 'School', 'reference', { filterable: true }),
    field('title', 'Title', 'text', {
      required: true,
      searchable: true,
      sortable: true,
    }),
    field('body', 'Message', 'richtext', { required: true, maxLength: 10000 }),
    field('audience', 'Audience', 'select', {
      required: true,
      options: ['all', 'students', 'parents', 'staff'].map((value) => ({
        label: value,
        value,
      })),
    }),
    field('publishAt', 'Publish At', 'datetime', {
      required: true,
      filterable: true,
    }),
    field('expiresAt', 'Expires At', 'datetime'),
    field('status', 'Status', 'select', {
      defaultValue: 'draft',
      filterable: true,
      options: ['draft', 'scheduled', 'published', 'archived'].map((value) => ({
        label: value,
        value,
      })),
    }),
  ]),
  entity('notificationTemplates', 'Notification Template', 'communications', [
    field('id', 'Template ID', 'readonly', {
      readonly: true,
      visibleInForm: false,
    }),
    field('tenantId', 'Tenant', 'reference', {
      readonly: true,
      visibleInForm: false,
    }),
    field('name', 'Template Name', 'text', {
      required: true,
      searchable: true,
    }),
    field('code', 'Template Code', 'text', {
      required: true,
      unique: true,
      searchable: true,
    }),
    field('channel', 'Channel', 'select', {
      required: true,
      filterable: true,
      options: ['email', 'sms', 'whatsapp', 'push', 'in-app'].map((value) => ({
        label: value,
        value,
      })),
    }),
    field('subject', 'Subject', 'text', { maxLength: 200 }),
    field('body', 'Body', 'richtext', { required: true, maxLength: 10000 }),
  ]),
  entity('notifications', 'Notification', 'communications', [
    field('id', 'Notification ID', 'readonly', {
      readonly: true,
      visibleInForm: false,
    }),
    field('tenantId', 'Tenant', 'reference', {
      readonly: true,
      visibleInForm: false,
    }),
    field('schoolId', 'School', 'reference', { filterable: true }),
    field('recipientId', 'Recipient', 'reference', {
      required: true,
      filterable: true,
    }),
    field('channel', 'Channel', 'select', {
      required: true,
      filterable: true,
      options: ['email', 'sms', 'whatsapp', 'push', 'in-app'].map((value) => ({
        label: value,
        value,
      })),
    }),
    field('subject', 'Subject', 'text', { maxLength: 200 }),
    field('body', 'Message', 'textarea', { required: true, maxLength: 10000 }),
    field('status', 'Status', 'select', {
      required: true,
      defaultValue: 'pending',
      filterable: true,
      options: ['pending', 'queued', 'sent', 'failed', 'cancelled'].map(
        (value) => ({ label: value, value }),
      ),
    }),
  ]),
  entity('reportDefinitions', 'Report Definition', 'reports', [
    field('id', 'Report ID', 'readonly', {
      readonly: true,
      visibleInForm: false,
    }),
    field('tenantId', 'Tenant', 'reference', {
      readonly: true,
      visibleInForm: false,
    }),
    field('name', 'Report Name', 'text', {
      required: true,
      searchable: true,
      sortable: true,
    }),
    field('code', 'Report Code', 'text', {
      required: true,
      unique: true,
      searchable: true,
    }),
    field('reportType', 'Report Type', 'select', {
      required: true,
      filterable: true,
      options: [
        'student',
        'attendance',
        'examination',
        'fee',
        'payroll',
        'inventory',
        'custom',
      ].map((value) => ({ label: value, value })),
    }),
    field('format', 'Format', 'select', {
      required: true,
      defaultValue: 'pdf',
      options: ['pdf', 'csv', 'xlsx', 'json'].map((value) => ({
        label: value,
        value,
      })),
    }),
  ]),
  entity('reportExecutionLogs', 'Report Execution Log', 'reports', [
    field('id', 'Execution ID', 'readonly', {
      readonly: true,
      visibleInForm: false,
    }),
    field('tenantId', 'Tenant', 'reference', {
      readonly: true,
      visibleInForm: false,
    }),
    field('schoolId', 'School', 'reference', { filterable: true }),
    field('reportDefinitionId', 'Report Definition', 'reference', {
      required: true,
      filterable: true,
    }),
    field('startedAt', 'Started At', 'datetime', {
      required: true,
      sortable: true,
      filterable: true,
    }),
    field('completedAt', 'Completed At', 'datetime'),
    field('status', 'Status', 'select', {
      required: true,
      defaultValue: 'queued',
      filterable: true,
      options: ['queued', 'running', 'completed', 'failed'].map((value) => ({
        label: value,
        value,
      })),
    }),
  ]),
  entity('subscriptionPlans', 'Subscription Plan', 'subscriptions', [
    field('id', 'Plan ID', 'readonly', {
      readonly: true,
      visibleInForm: false,
    }),
    field('name', 'Plan Name', 'text', {
      required: true,
      searchable: true,
      sortable: true,
    }),
    field('code', 'Plan Code', 'text', {
      required: true,
      unique: true,
      searchable: true,
    }),
    field('monthlyPrice', 'Monthly Price', 'currency', {
      required: true,
      min: 0,
      precision: 12,
      scale: 2,
    }),
    field('annualPrice', 'Annual Price', 'currency', {
      required: true,
      min: 0,
      precision: 12,
      scale: 2,
    }),
    field('status', 'Status', 'select', {
      defaultValue: 'active',
      filterable: true,
      options: ['active', 'inactive'].map((value) => ({ label: value, value })),
    }),
  ]),
  entity('subscriptions', 'Subscription', 'subscriptions', [
    field('id', 'Subscription ID', 'readonly', {
      readonly: true,
      visibleInForm: false,
    }),
    field('tenantId', 'Tenant', 'reference', {
      required: true,
      filterable: true,
    }),
    field('planId', 'Subscription Plan', 'reference', {
      required: true,
      filterable: true,
    }),
    field('startDate', 'Start Date', 'date', {
      required: true,
      filterable: true,
    }),
    field('endDate', 'End Date', 'date', { required: true, filterable: true }),
    field('billingCycle', 'Billing Cycle', 'select', {
      required: true,
      options: ['monthly', 'annual'].map((value) => ({ label: value, value })),
    }),
    field('status', 'Status', 'select', {
      required: true,
      defaultValue: 'active',
      filterable: true,
      options: ['trial', 'active', 'past_due', 'cancelled', 'expired'].map(
        (value) => ({ label: value, value }),
      ),
    }),
  ]),
  entity('documents', 'Document', 'documents', [
    field('id', 'Document ID', 'readonly', {
      readonly: true,
      visibleInForm: false,
    }),
    field('tenantId', 'Tenant', 'reference', {
      readonly: true,
      visibleInForm: false,
    }),
    field('schoolId', 'School', 'reference', { filterable: true }),
    field('name', 'Document Name', 'text', {
      required: true,
      searchable: true,
      sortable: true,
    }),
    field('documentType', 'Document Type', 'text', {
      required: true,
      filterable: true,
    }),
    field('fileUrl', 'File URL', 'file', { required: true, exportable: false }),
    field('status', 'Status', 'select', {
      defaultValue: 'active',
      filterable: true,
      options: ['active', 'archived', 'deleted'].map((value) => ({
        label: value,
        value,
      })),
    }),
  ]),
  entity('documentTemplates', 'Document Template', 'documents', [
    field('id', 'Template ID', 'readonly', {
      readonly: true,
      visibleInForm: false,
    }),
    field('tenantId', 'Tenant', 'reference', {
      readonly: true,
      visibleInForm: false,
    }),
    field('name', 'Template Name', 'text', {
      required: true,
      searchable: true,
    }),
    field('code', 'Template Code', 'text', {
      required: true,
      unique: true,
      searchable: true,
    }),
    field('documentType', 'Document Type', 'text', {
      required: true,
      filterable: true,
    }),
    field('body', 'Template Body', 'richtext', {
      required: true,
      maxLength: 50000,
    }),
  ]),
  entity('documentGenerationJobs', 'Document Generation Job', 'documents', [
    field('id', 'Job ID', 'readonly', { readonly: true, visibleInForm: false }),
    field('tenantId', 'Tenant', 'reference', {
      readonly: true,
      visibleInForm: false,
    }),
    field('schoolId', 'School', 'reference', { filterable: true }),
    field('templateId', 'Document Template', 'reference', {
      required: true,
      filterable: true,
    }),
    field('documentType', 'Document Type', 'text', { required: true }),
    field('status', 'Status', 'select', {
      required: true,
      defaultValue: 'queued',
      filterable: true,
      options: ['queued', 'processing', 'completed', 'failed'].map((value) => ({
        label: value,
        value,
      })),
    }),
  ]),
];
