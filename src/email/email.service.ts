import { Injectable, InternalServerErrorException } from '@nestjs/common';
import fs from 'fs/promises';
import Handlebars from 'handlebars';
import HandlebarHelpers from 'handlebars-helpers';
import mjml2html from 'mjml';
import path from 'path';

@Injectable()
export class EmailService {
    readFile = async (filePath: string, encoding: any): Promise<string> => {
        const file = await fs.readFile(filePath, { encoding });
        return file.toString('utf8');
    };

    interpolateJson = <T>(
        json: T,
        values: Record<string, string | string[]>,
    ): T => {
        const keys = Object.keys(values);
        keys.forEach((key) => {
            const value = values[key];
            if (typeof value === 'object') {
                value.forEach((v, i) => {
                    const regex = new RegExp(`{{${key}\\[${i}\\]}}`, 'g');
                    json = JSON.parse(JSON.stringify(json).replace(regex, v));
                });
            } else {
                const regex = new RegExp(`{{${key}}}`, 'g');
                json = JSON.parse(JSON.stringify(json).replace(regex, value));
            }
        });
        return json;
    };

    interpolateText = (
        text: string,
        options: Record<string, string>,
    ): string => {
        const translatedText = Object.keys(options).reduce((value, key) => {
            return value.replace(`{{${key}}}`, options[key]);
        }, text.toString());

        return translatedText;
    };

    buildEmailTemplate = async (
        templateName: string,
        context: Record<string, string | string[]>,
    ) => {
        try {
            const mjmlFile = await this.readFile(
                path.resolve(__dirname, `templates/${templateName}/index.mjml`),
                'utf8',
            );

            const { html } = mjml2html(mjmlFile, {
                filePath: path.join(__dirname, `templates/${templateName}`),
                mjmlConfigPath: path.join(__dirname, `.mjmlconfig`),
            });

            const helpers = HandlebarHelpers({ handlebars: Handlebars });
            Handlebars.registerHelper(helpers);
            const template = Handlebars.compile(html);

            const clonedContext = Object.assign({}, context);
            return template(clonedContext);
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(
                'Failed to build email template',
            );
        }
    };
}
