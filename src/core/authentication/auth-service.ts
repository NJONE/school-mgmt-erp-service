import { createHash, randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import type { Types } from 'mongoose';
import type { AppConfig } from '../../config/env.js';
import { AppError } from '../errors/app-error.js';
import { UserModel } from '../../modules/users/models/user.model.js';
import { RefreshTokenModel } from '../../modules/users/models/refresh-token.model.js';
import type { AuthenticatedIdentity } from './identity.js';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export class AuthenticationService {
  constructor(
    private readonly config: Pick<
      AppConfig,
      | 'JWT_ACCESS_SECRET'
      | 'JWT_REFRESH_SECRET'
      | 'JWT_ACCESS_EXPIRY'
      | 'JWT_REFRESH_EXPIRY'
    >,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ identity: AuthenticatedIdentity; tokens: TokenPair }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await UserModel.findOne({
      email: normalizedEmail,
      deletedAt: null,
    }).select('+passwordHash');

    if (!user) throw new AppError('Invalid email or password', 401);
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AppError('Account is temporarily locked', 423);
    }
    if (user.status !== 'active')
      throw new AppError('Account is inactive', 403);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save();
      throw new AppError('Invalid email or password', 401);
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await user.save();

    const identity = this.identityFromUser(user);
    return { identity, tokens: await this.createTokenPair(identity) };
  }

  async authenticateAccessToken(token: string): Promise<AuthenticatedIdentity> {
    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, this.config.JWT_ACCESS_SECRET) as JwtPayload;
    } catch {
      throw new AppError('Invalid or expired access token', 401);
    }
    if (payload.type !== 'access' || typeof payload.sub !== 'string') {
      throw new AppError('Invalid access token', 401);
    }

    const user = await UserModel.findOne({ _id: payload.sub, deletedAt: null });
    if (!user || user.status !== 'active')
      throw new AppError('Account is unavailable', 401);
    return this.identityFromUser(user);
  }

  async rotateRefreshToken(
    refreshToken: string,
  ): Promise<{ identity: AuthenticatedIdentity; tokens: TokenPair }> {
    let payload: JwtPayload;
    try {
      payload = jwt.verify(
        refreshToken,
        this.config.JWT_REFRESH_SECRET,
      ) as JwtPayload;
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }
    if (payload.type !== 'refresh' || typeof payload.sub !== 'string') {
      throw new AppError('Invalid refresh token', 401);
    }

    const tokenHash = this.hashRefreshToken(refreshToken);
    const stored = await RefreshTokenModel.findOne({
      tokenHash,
      userId: payload.sub,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });
    if (!stored) {
      if (typeof payload.familyId === 'string') {
        await RefreshTokenModel.updateMany(
          { familyId: payload.familyId, revokedAt: null },
          { $set: { revokedAt: new Date() } },
        );
      }
      throw new AppError('Refresh token is invalid or already used', 401);
    }

    stored.revokedAt = new Date();
    await stored.save();

    const user = await UserModel.findById(payload.sub);
    if (!user || user.deletedAt || user.status !== 'active') {
      throw new AppError('Account is unavailable', 401);
    }

    const identity = this.identityFromUser(user);
    return {
      identity,
      tokens: await this.createTokenPair(identity, stored.familyId),
    };
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    await RefreshTokenModel.updateOne(
      { tokenHash: this.hashRefreshToken(refreshToken) },
      { $set: { revokedAt: new Date() } },
    );
  }

  private identityFromUser(user: {
    _id: Types.ObjectId;
    tenantId?: Types.ObjectId | null;
    schoolId?: Types.ObjectId | null;
    branchId?: Types.ObjectId | null;
    academicSessionId?: Types.ObjectId | null;
    isPlatformAdmin: boolean;
    roleKeys: string[];
    permissions: string[];
  }): AuthenticatedIdentity {
    return {
      userId: user._id,
      tenantId: user.tenantId ?? null,
      schoolId: user.schoolId ?? null,
      branchId: user.branchId ?? null,
      academicSessionId: user.academicSessionId ?? null,
      isPlatformAdmin: user.isPlatformAdmin,
      roleKeys: user.roleKeys,
      permissions: user.permissions,
    };
  }

  private async createTokenPair(
    identity: AuthenticatedIdentity,
    familyId: string = randomUUID(),
  ): Promise<TokenPair> {
    const accessToken = jwt.sign(
      {
        sub: identity.userId.toString(),
        tenantId: identity.tenantId?.toString(),
        schoolId: identity.schoolId?.toString(),
        branchId: identity.branchId?.toString(),
        type: 'access',
      },
      this.config.JWT_ACCESS_SECRET,
      { expiresIn: this.config.JWT_ACCESS_EXPIRY } as SignOptions,
    );
    const refreshToken = jwt.sign(
      {
        sub: identity.userId.toString(),
        familyId,
        type: 'refresh',
        jti: randomUUID(),
      },
      this.config.JWT_REFRESH_SECRET,
      { expiresIn: this.config.JWT_REFRESH_EXPIRY } as SignOptions,
    );

    const expiresAt = new Date(Date.now() + this.refreshLifetimeMilliseconds());
    await RefreshTokenModel.create({
      tenantId: identity.tenantId,
      userId: identity.userId,
      tokenHash: this.hashRefreshToken(refreshToken),
      familyId,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.config.JWT_ACCESS_EXPIRY,
    };
  }

  private refreshLifetimeMilliseconds(): number {
    const match = /^(\d+)([dhm])$/.exec(this.config.JWT_REFRESH_EXPIRY);
    if (!match) return 7 * 24 * 60 * 60 * 1000;
    const value = Number(match[1]);
    if (match[2] === 'd') return value * 24 * 60 * 60 * 1000;
    if (match[2] === 'h') return value * 60 * 60 * 1000;
    return value * 60 * 1000;
  }

  private hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
