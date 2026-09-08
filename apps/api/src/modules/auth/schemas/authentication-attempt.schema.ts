import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AuthenticationAttemptDocument =
  HydratedDocument<AuthenticationAttempt>;

export enum AuthenticationAttemptStatus {
  PENDING = 'pending',
  AUTHENTICATED = 'authenticated',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

@Schema({
  collection: 'authentication_attempts',
  timestamps: true,
})
export class AuthenticationAttempt {
  _id!: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  attemptId!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId?: Types.ObjectId;

  @Prop({ index: true })
  emailNormalized?: string;

  @Prop({ required: true, index: true })
  purpose!: string;

  @Prop({ required: true })
  riskLevel!: string;

  @Prop({ type: [String], default: [] })
  requiredMethods!: string[];

  @Prop({ type: [String], default: [] })
  completedMethods!: string[];

  @Prop({
    required: true,
    enum: AuthenticationAttemptStatus,
    default: AuthenticationAttemptStatus.PENDING,
  })
  status!: AuthenticationAttemptStatus;

  @Prop()
  fingerprintHash?: string;

  @Prop()
  ipHash?: string;

  @Prop()
  userAgentHash?: string;

  @Prop({ required: true, index: true })
  expiresAt!: Date;

  @Prop()
  completedAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const AuthenticationAttemptSchema =
  SchemaFactory.createForClass(AuthenticationAttempt);

AuthenticationAttemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });