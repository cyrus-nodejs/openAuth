import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EMAIL_SENDER } from './email.service';
import { SmtpEmailSenderService } from './smtp-email-sender.service';

@Module({
  providers: [
    {
      provide: EMAIL_SENDER,
      useClass: SmtpEmailSenderService,
    },
    EmailService,
  ],
  exports: [EmailService],
})
export class EmailModule {}