// Import the framework and instantiate it
import Fastify, { FastifyRequest } from 'fastify';
import * as mjAPI from 'mathjax-node';
import * as svg2png from 'svg2png';
import axios from 'axios';
import { config } from 'dotenv';
import FormData from 'form-data';

config();

interface LoggerTransport {
    [key: string]: any;
}

const envToLogger: LoggerTransport = {
    development: {
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname'
            }
        }
    },
    production: true,
    test: false
};

const fastify = Fastify({
    logger: envToLogger[process.env.NODE_ENV ?? 'production'] ?? true
});

interface ReqBody {
    content: string;
}

mjAPI.config({
    MathJax: {}
});
mjAPI.start();

fastify.post(
    '/generate',
    async function handler(req: FastifyRequest<{ Body: ReqBody }>, res) {
        console.log(req?.body);
        if (!req?.body?.content) {
            throw new Error('No content provided');
        }
        await mjAPI.typeset({
            math: req?.body?.content,
            format: 'TeX', // or "inline-TeX", "MathML"
            svg: true // or svg:true, or html:true
        });

        const typesetResult = await mjAPI.typeset({
            math: req?.body?.content,
            format: 'TeX', // or "inline-TeX", "MathML"
            svg: true // or svg:true, or html:true
        });

        if (!typesetResult.errors) {
            let svgString = typesetResult.svg;
            svgString = svgString.replace(
                '<svg ',
                '<svg style="background-color: white;" '
            );

            const buffer = Buffer.from(svgString);
            const resultImage = svg2png.sync(buffer, { height: 200 });
            const uploadJob = async () => {
                const form = new FormData();
                form.append('i', process.env.MISSKEY_TOKEN ?? 'none');
                form.append('file', Buffer.from(resultImage));
                const uploadResult = await axios.post(
                    `${process.env.MISSKEY_HOST}/api/drive/files/create`,
                    form
                );

                console.log(uploadResult.data);

                const result2 = await axios.post(
                    `${process.env.MISSKEY_HOST}/api/notes/create`,
                    {
                        mediaIds: [uploadResult.data.id],
                        i: process.env.MISSKEY_TOKEN
                    }
                );
            };
            const wrapper = async () => {
                try {
                    await uploadJob();
                } catch (e) {
                    console.error(e);
                    console.error((e as any).response.data);
                }
            };
            wrapper();
            res.type('image/png').send(resultImage);
        } else {
            throw new Error('Failed to generate SVG');
        }
    }
);
(async () => {
    // Run the server!
    try {
        await fastify.listen({ port: Number(process.env.PORT ?? 8080) });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
})();
