import type { FilterQuery, Model } from 'mongoose';
import type { Types } from 'mongoose';
import type { EntityMetadata } from '../metadata/interfaces/metadata.js';
import { AppError } from '../errors/app-error.js';
import type { TenantContext } from '../tenancy/tenant-context.js';
import { escapeRegex } from '../utilities/escape-regex.js';
import { parseListQuery } from './query-parser.js';
import { metadataModelRegistry } from './metadata-model-registry.js';

export class GenericCrudService {
  async create(
    metadata: EntityMetadata,
    payload: Record<string, unknown>,
    context: TenantContext,
  ): Promise<Record<string, unknown>> {
    const model = this.requireModel(metadata.entityCode);
    const data = this.allowlistedPayload(
      metadata,
      payload,
      context.isPlatformAdmin,
    );
    this.stripScopeAndIdentityFields(data);
    const scoped = this.applyScopeToCreate(data, context);
    const document = await model.create(scoped);
    return this.serialize(document);
  }

  async getById(
    metadata: EntityMetadata,
    id: string,
    context: TenantContext,
  ): Promise<Record<string, unknown> | null> {
    const model = this.requireModel(metadata.entityCode);
    const document = await model
      .findOne({
        _id: id,
        deletedAt: null,
        ...this.scopeFilter(context, metadata),
      })
      .lean();
    return document ? this.serialize(document) : null;
  }

  async list(
    metadata: EntityMetadata,
    query: Record<string, unknown>,
    context: TenantContext,
  ): Promise<{
    data: Record<string, unknown>[];
    meta: Record<string, number>;
  }> {
    const model = this.requireModel(metadata.entityCode);
    const parsed = parseListQuery(query, metadata);
    const filter: FilterQuery<Record<string, unknown>> = {
      deletedAt: null,
      ...this.scopeFilter(context, metadata),
      ...parsed.filters,
    };
    if (parsed.search && metadata.searchFields.length > 0) {
      const regex = new RegExp(escapeRegex(parsed.search), 'i');
      filter.$or = metadata.searchFields
        .filter(
          (key) =>
            metadata.fields.find((field) => field.key === key)?.searchable,
        )
        .map((key) => ({ [key]: regex }));
    }

    const skip = (parsed.page - 1) * parsed.pageSize;
    const projection = parsed.fields
      ? Object.fromEntries(parsed.fields.map((field) => [field, 1]))
      : undefined;
    const [documents, totalRecords] = await Promise.all([
      model
        .find(filter, projection)
        .sort({ [parsed.sortBy]: parsed.sortOrder })
        .skip(skip)
        .limit(parsed.pageSize)
        .lean(),
      model.countDocuments(filter),
    ]);
    return {
      data: documents.map((document) => this.serialize(document)),
      meta: {
        page: parsed.page,
        pageSize: parsed.pageSize,
        totalRecords,
        totalPages: Math.ceil(totalRecords / parsed.pageSize),
      },
    };
  }

  async update(
    metadata: EntityMetadata,
    id: string,
    payload: Record<string, unknown>,
    context: TenantContext,
  ): Promise<Record<string, unknown> | null> {
    const model = this.requireModel(metadata.entityCode);
    const data = this.allowlistedPayload(
      metadata,
      payload,
      context.isPlatformAdmin,
    );
    this.stripScopeAndIdentityFields(data);
    const document = await model
      .findOneAndUpdate(
        { _id: id, deletedAt: null, ...this.scopeFilter(context, metadata) },
        { $set: data },
        { new: true, runValidators: true },
      )
      .lean();
    return document ? this.serialize(document) : null;
  }

  async softDelete(
    metadata: EntityMetadata,
    id: string,
    context: TenantContext,
  ): Promise<boolean> {
    const model = this.requireModel(metadata.entityCode);
    const result = await model.updateOne(
      { _id: id, deletedAt: null, ...this.scopeFilter(context, metadata) },
      { $set: { deletedAt: new Date() } },
    );
    return result.modifiedCount === 1;
  }

  async count(
    metadata: EntityMetadata,
    query: Record<string, unknown>,
    context: TenantContext,
  ): Promise<number> {
    const model = this.requireModel(metadata.entityCode);
    const parsed = parseListQuery(query, metadata);
    return model.countDocuments({
      deletedAt: null,
      ...this.scopeFilter(context, metadata),
      ...parsed.filters,
    });
  }

  private requireModel(entityCode: string): Model<Record<string, unknown>> {
    const model = metadataModelRegistry.get(entityCode);
    if (!model) throw new AppError('Entity is not registered', 404);
    return model;
  }

  private allowlistedPayload(
    metadata: EntityMetadata,
    payload: Record<string, unknown>,
    isPlatformAdmin = false,
  ): Record<string, unknown> {
    const allowed = new Set(
      metadata.fields
        .filter(
          (field) =>
            (!field.readonly ||
              (isPlatformAdmin && field.key === 'tenantId')) &&
            !field.hidden &&
            !field.sensitive &&
            field.key !== 'id',
        )
        .map((field) => field.key),
    );
    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(payload)) {
      if (isPlatformAdmin && key === 'tenantId') {
        data[key] = value;
        continue;
      }
      if (
        [
          'tenantId',
          'schoolId',
          'branchId',
          'academicSessionId',
          'id',
          'createdAt',
          'updatedAt',
        ].includes(key)
      ) {
        continue;
      }
      const field = metadata.fields.find((candidate) => candidate.key === key);
      if (field?.readonly || field?.hidden) {
        continue;
      }
      if (field?.sensitive) {
        throw new AppError(`Field "${key}" is not allowed`, 400);
      }
      if (!allowed.has(key)) {
        throw new AppError(`Field "${key}" is not allowed`, 400);
      }
      if (
        key.startsWith('$') ||
        (typeof value === 'object' && value !== null && key === '$where')
      ) {
        throw new AppError('MongoDB operators are not allowed', 400);
      }
      data[key] = value;
    }
    return data;
  }

  private stripScopeAndIdentityFields(data: Record<string, unknown>): void {
    delete data.schoolId;
    delete data.branchId;
    delete data.academicSessionId;
    delete data.id;
    delete data.createdAt;
    delete data.updatedAt;
  }

  private applyScopeToCreate(
    data: Record<string, unknown>,
    context: TenantContext,
  ): Record<string, unknown> {
    if (!context.isPlatformAdmin) {
      if (!context.tenantId)
        throw new AppError('Tenant context is required', 403);
      data.tenantId = context.tenantId;
    } else if (!data.tenantId) {
      throw new AppError('Platform administrators must specify tenantId', 400);
    }
    if (context.schoolId) data.schoolId = context.schoolId;
    if (context.branchId) data.branchId = context.branchId;
    if (context.academicSessionId)
      data.academicSessionId = context.academicSessionId;
    return data;
  }

  private scopeFilter(
    context: TenantContext,
    metadata: EntityMetadata,
  ): FilterQuery<Record<string, unknown>> {
    if (context.isPlatformAdmin) return {};
    if (!context.tenantId)
      throw new AppError('Tenant context is required', 403);
    const filter: FilterQuery<Record<string, unknown>> = {
      tenantId: context.tenantId,
    };
    if (metadata.schoolScoped && context.schoolId)
      filter.schoolId = context.schoolId;
    if (metadata.branchScoped && context.branchId)
      filter.branchId = context.branchId;
    if (metadata.academicSessionScoped && context.academicSessionId) {
      filter.academicSessionId = context.academicSessionId;
    }
    return filter;
  }

  private serialize(
    document: Record<string, unknown>,
  ): Record<string, unknown> {
    const source =
      typeof (document as { toObject?: () => Record<string, unknown> })
        .toObject === 'function'
        ? (document as { toObject: () => Record<string, unknown> }).toObject()
        : document;
    const result = { ...source };
    const id = result._id as Types.ObjectId | undefined;
    if (id) result.id = id.toString();
    delete result._id;
    delete result.deletedAt;
    delete result.passwordHash;
    delete result.refreshToken;
    delete result.otp;
    return result;
  }
}
