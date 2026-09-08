import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SessionDocument = HydratedDocument<Session>;

@Schema({
  collection: 'sessions',
  timestamps: true,
})
export class Session {
  _id!: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  sessionId!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  tokenFamilyId!: string;

  @Prop({ required: true })
  authenticationLevel!: string;

  @Prop({ required: true })
  riskLevel!: string;

  @Prop()
  fingerprintHash?: string;

  @Prop()
  userAgentHash?: string;

  @Prop()
  ipHash?: string;

  @Prop({ required: true })
  lastActivityAt!: Date;

  @Prop({ required: true, index: true })
  expiresAt!: Date;

  @Prop()
  revokedAt?: Date;

  @Prop()
  revokeReason?: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

SessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 },
);

SessionSchema.index({ tokenFamilyId: 1 });