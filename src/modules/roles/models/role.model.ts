import mongoose from 'mongoose';
import { Schema, model, type InferSchemaType, type Model } from 'mongoose';

const roleSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      default: null,
      index: true,
    },
    key: { type: String, required: true, trim: true, maxLength: 80 },
    name: { type: String, required: true, trim: true, maxLength: 120 },
    permissions: [{ type: String, required: true, trim: true }],
    system: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true, versionKey: '__v', collection: 'roles' },
);

roleSchema.index(
  { tenantId: 1, key: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);

export type RoleDocument = InferSchemaType<typeof roleSchema>;
export const RoleModel =
  (mongoose.models.Role as Model<RoleDocument> | undefined) ??
  model<RoleDocument>('Role', roleSchema);
