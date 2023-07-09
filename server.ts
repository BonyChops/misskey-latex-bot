// Import the framework and instantiate it
import Fastify, { FastifyRequest } from 'fastify';
import axios from 'axios';
import { config } from 'dotenv';
import FormData from 'form-data';
import { mathjax } from 'mathjax-full/js/mathjax';
import { TeX } from 'mathjax-full/js/input/tex';
import { SVG } from 'mathjax-full/js/output/svg';
import { LiteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages';
import sharp from 'sharp';

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

fastify.post(
    '/generate',
    async function handler(req: FastifyRequest<{ Body: ReqBody }>, res) {
        // for check misskey webhook body
        console.log(req?.body);
        if (!req?.body?.content) {
            throw new Error('No content provided');
        }
        const adaptor = new LiteAdaptor();
        (RegisterHTMLHandler as any)(adaptor);

        const html = mathjax.document('', {
            InputJax: new TeX({ packages: AllPackages }),
            OutputJax: new SVG({ fontCache: 'none' })
        });

        const svg = adaptor.innerHTML(
            html.convert(req?.body?.content, { display: true })
        );

        const png = await sharp(Buffer.from(svg))
            .resize({ height: 200 })
            .flatten({ background: { r: 255, g: 255, b: 255 } })
            .png()
            .toBuffer();

        const uploadJob = async () => {
            const form = new FormData();
            form.append('i', process.env.MISSKEY_TOKEN ?? 'none');
            form.append('file', Buffer.from(png));
            const uploadResult = await axios.post(
                `${process.env.MISSKEY_HOST}/api/drive/files/create`,
                form
            );

            await axios.post(`${process.env.MISSKEY_HOST}/api/notes/create`, {
                mediaIds: [uploadResult.data.id],
                i: process.env.MISSKEY_TOKEN
            });
        };
        const wrapper = async () => {
            try {
                await uploadJob();
            } catch (e) {
                console.error(e);
                console.error((e as any).response.data);
            }
        };
        // wrapper();
        res.type('image/png').send(png);
    }
);
(async () => {
    // Run the server!
    try {
        await fastify.listen({
            host: '0.0.0.0',
            port: Number(process.env.PORT ?? 8080)
        });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
})();
