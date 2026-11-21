import mongoose, {
  Schema,
  type Model,
  type SchemaDefinition,
  type SchemaTypeOptions,
} from 'mongoose';
import type { FieldMetadata } from '../metadata/interfaces/metadata.js';
import { metadataRegistry } from '../metadata/registry/index.js';

export class MetadataModelRegistry {
  private readonly models = new Map<string, Model<Record<string, unknown>>>();

  get(entityCode: string): Model<Record<string, unknown>> | undefined {
    return this.models.get(entityCode) ?? this.buildAndCache(entityCode);
  }

  private buildAndCache(
    entityCode: string,
  ): Model<Record<string, unknown>> | undefined {
    const metadata = metadataRegistry.getByEntityCode(entityCode);
    if (!metadata) return undefined;

    const modelName = `Crud_${metadata.entityCode}`;
    const existing = mongoose.models[modelName] as
      Model<Record<string, unknown>> | undefined;
    if (existing) {
      this.models.set(entityCode, existing);
      return existing;
    }

    const definition: SchemaDefinition = {
      tenantId: { type: Schema.Types.ObjectId, index: true, default: null },
      schoolId: { type: Schema.Types.ObjectId, index: true, default: null },
      branchId: { type: Schema.Types.ObjectId, index: true, default: null },
      academicSessionId: {
        type: Schema.Types.ObjectId,
        index: true,
        default: null,
      },
      deletedAt: { type: Date, default: null, index: true },
    };

    for (const field of metadata.fields) {
      if (
        [
          'id',
          'tenantId',
          'schoolId',
          'branchId',
          'academicSessionId',
          'createdAt',
          'updatedAt',
        ].includes(field.key)
      )
        continue;
      const options = this.schemaOptions(field);
      if (options) definition[field.key] = options;
    }

    const schema = new Schema(definition, {
      timestamps: true,
      versionKey: '__v',
      collection: metadata.collectionName,
      strict: 'throw',
    });
    if (metadata.fields.some((field) => field.unique)) {
      const uniqueKeys = metadata.fields
        .filter((field) => field.unique)
        .map((field) => field.key);
      const compoundIndex: Record<string, 1> = { tenantId: 1 };
      for (const key of uniqueKeys) compoundIndex[key] = 1;
      schema.index(compoundIndex, {
        unique: true,
        partialFilterExpression: { deletedAt: null },
      });
    }
    schema.index({ tenantId: 1, schoolId: 1, branchId: 1, deletedAt: 1 });

    const model = mongoose.model<Record<string, unknown>>(modelName, schema);
    this.models.set(entityCode, model);
    return model;
  }

  private schemaOptions(
    field: FieldMetadata,
  ): SchemaTypeOptions<unknown> | undefined {
    if (field.type === 'array') {
      return {
        type: [this.arrayItemType(field)],
        required: field.required ? true : false,
        default: field.defaultValue,
      } as SchemaTypeOptions<unknown>;
    }
    let type: unknown;
    switch (field.type) {
      case 'integer':
      case 'number':
      case 'decimal':
      case 'currency':
      case 'percentage':
        type = Number;
        break;
      case 'boolean':
      case 'checkbox':
        type = Boolean;
        break;
      case 'date':
      case 'datetime':
        type = Date;
        break;
      case 'reference':
        type = Schema.Types.ObjectId;
        break;
      case 'object':
      case 'address':
      case 'json':
        type = Schema.Types.Mixed;
        break;
      case 'computed':
      case 'readonly':
        return undefined;
      default:
        type = String;
    }

    return {
      type,
      required: field.required ? true : false,
      default: field.defaultValue,
      trim: typeof type === 'function' ? type === String : false,
      lowercase: field.type === 'email',
      minlength: field.minLength,
      maxlength: field.maxLength,
      min: field.min,
      max: field.max,
      enum: field.options?.map((option) => option.value),
    } as SchemaTypeOptions<unknown>;
  }

  private arrayItemType(field: FieldMetadata): unknown {
    if (field.arrayConfig?.itemType === 'reference')
      return Schema.Types.ObjectId;
    if (
      field.arrayConfig?.itemType === 'number' ||
      field.arrayConfig?.itemType === 'integer'
    )
      return Number;
    if (field.arrayConfig?.itemType === 'boolean') return Boolean;
    return String;
  }
}

export const metadataModelRegistry = new MetadataModelRegistry();
