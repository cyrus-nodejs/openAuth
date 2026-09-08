import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

@Schema({
  collection: 'users',
  timestamps: true,
})
export class User {
  _id!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  email!: string;

  @Prop({ required: true, unique: true, index: true })
  emailNormalized!: string;

  @Prop({ trim: true, maxlength: 120 })
  displayName?: string;

  @Prop({
    required: true,
    enum: UserStatus,
    default: UserStatus.ACTIVE,
    index: true,
  })
  status!: UserStatus;

  @Prop()
  emailVerifiedAt?: Date;

  @Prop()
  lastLoginAt?: Date;

  @Prop({ required: true, default: 0 })
  securityVersion!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ emailNormalized: 1 }, { unique: true });