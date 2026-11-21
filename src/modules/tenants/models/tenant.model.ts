import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from 'mongoose';

const tenantSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxLength: 200 },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxLength: 30,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'inactive'],
      default: 'active',
      index: true,
    },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true, versionKey: '__v', collection: 'tenants' },
);

tenantSchema.index({ code: 1 }, { unique: true });

export type TenantDocument = InferSchemaType<typeof tenantSchema>;
export const TenantModel =
  (models.Tenant as Model<TenantDocument> | undefined) ??
  model<TenantDocument>('Tenant', tenantSchema);
