import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as mjml2html from 'mjml/lib';
import handlebars from 'handlebars';

@Injectable()
export class EmailService {
    readFile = async (filePath: string, encoding: any): Promise<string> => {
        const file = await fs.readFile(filePath, { encoding });
        return file as unknown as string;
    };

    buildEmailTemplate = async (templateName: string) => {
        try {
            const mjmlFile = await this.readFile(
                path.resolve(__dirname, `templates/${templateName}/index.mjml`),
                'utf8',
            );

            const { html } = mjml2html(mjmlFile, {
                filePath: path.join(__dirname, `templates/${templateName}`),
                mjmlConfigPath: path.join(__dirname, `.mjmlconfig`),
            });

            const template = handlebars.compile(html);
            return template(html);
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(
                'Failed to build email template',
            );
        }
    };
}
