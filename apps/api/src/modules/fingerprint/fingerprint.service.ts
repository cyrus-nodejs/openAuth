import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  DeviceFingerprint,
  DeviceFingerprintDocument,
  FingerprintStatus,
  FingerprintTrustLevel,
} from './schemas/device-fingerprint.schema';
import { SecurityEventService } from '../security-events/security-event.service';
import { SecurityEventType } from '../security-events/schemas/security-event.schema';

@Injectable()
export class FingerprintService {
  constructor(
    @InjectModel(DeviceFingerprint.name)
    private readonly model: Model<DeviceFingerprintDocument>,
    private readonly events: SecurityEventService,
  ) {}

  async isTrusted(
    userId: Types.ObjectId,
    fingerprintHash: string,
  ) {
    const device = await this.model.findOne({
      userId,
      fingerprintHash,
      status: FingerprintStatus.ACTIVE,
    });

    return (
      device?.trustLevel === FingerprintTrustLevel.TRUSTED
    );
  }

  async observe(input: {
    userId: Types.ObjectId;
    fingerprintHash: string;
    ipHash?: string;
    userAgentHash?: string;
  }) {
    return this.model.findOneAndUpdate(
      {
        userId: input.userId,
        fingerprintHash: input.fingerprintHash,
      },
      {
        $set: {
          lastSeenAt: new Date(),
          lastIpHash: input.ipHash,
          userAgentHash: input.userAgentHash,
        },
        $setOnInsert: {
          firstSeenAt: new Date(),
          trustLevel: FingerprintTrustLevel.UNKNOWN,
          status: FingerprintStatus.ACTIVE,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );
  }

  async trust(
    userId: Types.ObjectId,
    fingerprintHash: string,
  ) {
    const device = await this.model.findOneAndUpdate(
      {
        userId,
        fingerprintHash,
      },
      {
        $set: {
          trustLevel: FingerprintTrustLevel.TRUSTED,
          status: FingerprintStatus.ACTIVE,
          lastSeenAt: new Date(),
        },
        $setOnInsert: {
          firstSeenAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    await this.events.record({
      userId,
      fingerprintHash,
      eventType:
        SecurityEventType.FINGERPRINT_TRUST_CHANGED,
      metadata: {
        trustLevel: FingerprintTrustLevel.TRUSTED,
      },
    });

    return device;
  }

  async revoke(
    userId: Types.ObjectId,
    fingerprintHash: string,
  ) {
    return this.model.findOneAndUpdate(
      {
        userId,
        fingerprintHash,
      },
      {
        $set: {
          status: FingerprintStatus.REVOKED,
          trustLevel: FingerprintTrustLevel.UNKNOWN,
        },
      },
      { new: true },
    );
  }
}