import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from 'mongoose';

const permissionSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      default: null,
      index: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxLength: 120,
    },
    name: { type: String, required: true, trim: true, maxLength: 160 },
    description: { type: String, trim: true, maxLength: 500 },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true, versionKey: '__v', collection: 'permissions' },
);

permissionSchema.index(
  { tenantId: 1, key: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);

export type PermissionDocument = InferSchemaType<typeof permissionSchema>;
export const PermissionModel =
  (models.Permission as Model<PermissionDocument> | undefined) ??
  model<PermissionDocument>('Permission', permissionSchema);
