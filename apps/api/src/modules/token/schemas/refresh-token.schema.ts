import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema({
  collection: 'refresh_tokens',
  timestamps: true,
})
export class RefreshToken {
  _id!: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  tokenId!: string;

  @Prop({ required: true })
  tokenHash!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  sessionId!: string;

  @Prop({ required: true, index: true })
  tokenFamilyId!: string;

  @Prop({ index: true })
  parentTokenId?: string;

  @Prop({ required: true, default: 'active' })
  status!: string;

  @Prop({ required: true, index: true })
  expiresAt!: Date;

  @Prop()
  usedAt?: Date;

  @Prop()
  revokedAt?: Date;
}

export const RefreshTokenSchema =
  SchemaFactory.createForClass(RefreshToken);

RefreshTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 },
);

RefreshTokenSchema.index({ tokenFamilyId: 1 });