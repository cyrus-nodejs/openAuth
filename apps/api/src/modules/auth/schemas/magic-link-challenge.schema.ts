import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MagicLinkChallengeDocument =
  HydratedDocument<MagicLinkChallenge>;

@Schema({
  collection: 'magic_link_challenges',
  timestamps: true,
})
export class MagicLinkChallenge {
  _id!: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  challengeId!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId?: Types.ObjectId;

  @Prop({ index: true })
  attemptId?: string;

  @Prop({ required: true })
  tokenHash!: string;

  @Prop({ required: true, index: true })
  purpose!: string;

  @Prop({ required: true, default: 'active' })
  status!: string;

  @Prop({ required: true, index: true })
  expiresAt!: Date;

  @Prop()
  consumedAt?: Date;

  @Prop()
  fingerprintHash?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const MagicLinkChallengeSchema =
  SchemaFactory.createForClass(MagicLinkChallenge);

MagicLinkChallengeSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 },
);