import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from 'mongoose';

const userSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      default: null,
      index: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      default: null,
      index: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
      index: true,
    },
    academicSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicSession',
      default: null,
    },
    isPlatformAdmin: { type: Boolean, default: false, index: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxLength: 254,
    },
    passwordHash: { type: String, required: true, select: false },
    displayName: { type: String, required: true, trim: true, maxLength: 160 },
    status: {
      type: String,
      enum: ['active', 'inactive', 'locked'],
      default: 'active',
      index: true,
    },
    failedLoginAttempts: { type: Number, default: 0, min: 0, max: 100 },
    lockedUntil: { type: Date, default: null },
    roleKeys: [{ type: String, trim: true }],
    permissions: [{ type: String, trim: true }],
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true, versionKey: '__v', collection: 'users' },
);

userSchema.index(
  { tenantId: 1, email: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);
userSchema.index({ tenantId: 1, status: 1 });

export type UserDocument = InferSchemaType<typeof userSchema>;
export const UserModel =
  (models.User as Model<UserDocument> | undefined) ??
  model<UserDocument>('User', userSchema);
