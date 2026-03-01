import { randomUUID } from 'crypto';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express, { ErrorRequestHandler, Request, Response } from 'express';
import pinoHttp from 'pino-http';

import { INTERNAL_SERVER_ERROR_RESPONSE } from '@/constants';
import logger from '@/logger';
import { authRouter } from '@/routes/auth';
import { cronRouter } from '@/routes/cron';
import { dishRouter } from '@/routes/dish';
import { qrCodeRouter } from '@/routes/qrCode';
import { transactionsRouter } from '@/routes/transactions';
import { userRouter } from '@/routes/users';
import { EmailClient, initializeEmailCron } from '@/services/cron/emailCron';
import { fetchEmailCron } from '@/services/email';

const app = express();
dotenv.config();
const corsOptions = {
    origin: '*', // This is your front-end origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Include OPTIONS for preflight requests
    allowedHeaders: 'Content-Type,Authorization,session-token', // Include custom headers
    credentials: true, // This is important because you are sending a session token in your request
    optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use(
    pinoHttp({
        logger,
        genReqId: (req, res) => {
            const id = req.headers['x-request-id'] || randomUUID();
            res.setHeader('x-request-id', id);
            return id;
        },
    }),
);

// Initialize cron jobs if enabled in firebase
const handleCron = async () => {
    // initializeEmailCron({ cronExpression: "0 0 12 * * MON,THU"}, EmailClient.AWS)
    const cron = await fetchEmailCron();
    if (cron && cron?.enabled) {
        logger.info('Initializing cron jobs');
        initializeEmailCron({ cronExpression: cron.expression }, EmailClient.AWS);
    }
};

app.get('/health', (_: Request, res: Response) => {
    res.status(200).send('OK');
});

// TODO: audit all route names for REST best practices; they're a mixed bag right now
app.use('/api/auth', authRouter);
app.use('/api/dish', dishRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/users', userRouter);
app.use('/api/qrcode', qrCodeRouter);
app.use('/api/cron', cronRouter);

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    logger.error({
        reqId: req.id,
        err,
    });
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE);
};
app.use(errorHandler);

handleCron();

export { app };
