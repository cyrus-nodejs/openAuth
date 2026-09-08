import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Model,
  Types,
} from 'mongoose';

import {
  SecurityEvent,
  SecurityEventDocument,
  SecurityEventType,
} from './schemas/security-event.schema';

import {
  RequestContextService,
} from '../../common/request-context/request-context.service';

export interface SecurityEventInput {
  userId?: string | Types.ObjectId;
  sessionId?: string;
  attemptId?: string;
  eventType: SecurityEventType;
  riskLevel?: string;
  ipHash?: string;
  fingerprintHash?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class SecurityEventService {
  constructor(
    @InjectModel(SecurityEvent.name)
    private readonly model:
      Model<SecurityEventDocument>,
    private readonly context:
      RequestContextService,
  ) {}

  async record(
    input: SecurityEventInput,
  ) {
    const requestId =
      this.context.getRequestId();

    return this.model.create({
      ...input,
      userId: input.userId
        ? new Types.ObjectId(
            input.userId,
          )
        : undefined,
      metadata: {
        ...(input.metadata ?? {}),
        requestId,
      },
    });
  }
}