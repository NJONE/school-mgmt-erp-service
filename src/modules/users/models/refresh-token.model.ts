import mongoose from 'mongoose';
import {
  Schema,
  model,
  type InferSchemaType,
  type Model,
} from 'mongoose';

const refreshTokenSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      default: null,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: { type: String, required: true, unique: true, select: false },
    familyId: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: '__v', collection: 'refresh_tokens' },
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RefreshTokenDocument = InferSchemaType<typeof refreshTokenSchema>;
export const RefreshTokenModel =
  (mongoose.models.RefreshToken as Model<RefreshTokenDocument> | undefined) ??
  model<RefreshTokenDocument>('RefreshToken', refreshTokenSchema);
