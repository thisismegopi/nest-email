import { Body, Controller, Get, Param } from '@nestjs/common';

import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
    constructor(private readonly emailService: EmailService) {}

    @Get('preview/:templateName')
    previewTemplate(
        @Param('templateName') templateName: string,
        @Body() context: Record<string, string | string[]>,
    ) {
        return this.emailService.buildEmailTemplate(templateName, context);
    }
}
