import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RecoveryCodeDocument =
  HydratedDocument<RecoveryCode>;

@Schema({
  collection: 'recovery_codes',
  timestamps: true,
})
export class RecoveryCode {
  _id!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  codeHash!: string;

  @Prop({ required: true })
  codeIndex!: number;

  @Prop({ default: 'active', index: true })
  status!: string;

  @Prop()
  usedAt?: Date;

  @Prop()
  revokedAt?: Date;
}

export const RecoveryCodeSchema =
  SchemaFactory.createForClass(RecoveryCode);

RecoveryCodeSchema.index({
  userId: 1,
  codeIndex: 1,
});