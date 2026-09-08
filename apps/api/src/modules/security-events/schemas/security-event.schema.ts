import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SecurityEventDocument =
  HydratedDocument<SecurityEvent>;

export enum SecurityEventType {
  SIGNUP_STARTED = 'SIGNUP_STARTED',
  SIGNUP_COMPLETED = 'SIGNUP_COMPLETED',
  LOGIN_STARTED = 'LOGIN_STARTED',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  MAGIC_LINK_CREATED = 'MAGIC_LINK_CREATED',
  MAGIC_LINK_CONSUMED = 'MAGIC_LINK_CONSUMED',
  OTP_CREATED = 'OTP_CREATED',
  OTP_FAILED = 'OTP_FAILED',
  OTP_SUCCESS = 'OTP_SUCCESS',
  PASSKEY_REGISTERED = 'PASSKEY_REGISTERED',
  PASSKEY_AUTHENTICATED = 'PASSKEY_AUTHENTICATED',
  GOOGLE_AUTHENTICATED = 'GOOGLE_AUTHENTICATED',
  RECOVERY_STARTED = 'RECOVERY_STARTED',
  RECOVERY_COMPLETED = 'RECOVERY_COMPLETED',
  REFRESH_REUSE_DETECTED = 'REFRESH_REUSE_DETECTED',
  SESSION_CREATED = 'SESSION_CREATED',
  SESSION_REVOKED = 'SESSION_REVOKED',
  FINGERPRINT_TRUST_CHANGED = 'FINGERPRINT_TRUST_CHANGED',
}

@Schema({
  collection: 'security_events',
  timestamps: true,
})
export class SecurityEvent {
  _id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId?: Types.ObjectId;

  @Prop({ index: true })
  sessionId?: string;

  @Prop({ index: true })
  attemptId?: string;

  @Prop({
    required: true,
    enum: SecurityEventType,
    index: true,
  })
  eventType!: SecurityEventType;

  @Prop()
  riskLevel?: string;

  @Prop()
  ipHash?: string;

  @Prop({
    required: true,
    index: true,
  })
  requestId!: string;

  @Prop()
  fingerprintHash?: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

export const SecurityEventSchema =
  SchemaFactory.createForClass(SecurityEvent);

SecurityEventSchema.index({ createdAt: 1 });
SecurityEventSchema.index({ userId: 1, createdAt: -1 });
SecurityEventSchema.index({
    requestId: 1,
  });