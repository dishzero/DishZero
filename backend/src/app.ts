import express, { Response, Request } from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import pinoHttp from 'pino-http'
import cookieParser from 'cookie-parser'
import { randomUUID } from 'crypto'
import { dishRouter } from '@/routes/dish'
import { transactionsRouter } from '@/routes/transactions'
import { userRouter } from '@/routes/users'
import { authRouter } from '@/routes/auth'
import { qrCodeRouter } from '@/routes/qrCode'
import { cronRouter } from '@/routes/cron'
import { EmailClient, initializeEmailCron } from '@/services/cron/emailCron'
import logger from '@/logger'
import { fetchEmailCron } from '@/services/email'

const app = express()
dotenv.config()
const corsOptions = {
    origin: '*', // This is your front-end origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Include OPTIONS for preflight requests
    allowedHeaders: 'Content-Type,Authorization,session-token', // Include custom headers
    credentials: true, // This is important because you are sending a session token in your request
    optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

app.use(
    pinoHttp({
        logger,
        genReqId: (req, res) => {
            const id = req.headers['x-request-id'] || randomUUID()
            res.setHeader('x-request-id', id)
            return id
        },
    })
)

// Initialize cron jobs if enabled in firebase
const handleCron = async () => {
    // initializeEmailCron({ cronExpression: "0 0 12 * * MON,THU"}, EmailClient.AWS)
    const cron = await fetchEmailCron()
    if (cron && cron?.enabled) {
        logger.info('Initializing cron jobs')
        initializeEmailCron({ cronExpression: cron.expression }, EmailClient.AWS)
    }
}

app.get('/health', (_: Request, res: Response) => {
    res.status(200).send('OK')
})

// TODO: audit all route names for REST best practices; they're a mixed bag right now
// TODO: audit all routes for consistent try-catch (look into error handling in the middleware?)
app.use('/api/auth', authRouter)
app.use('/api/dish', dishRouter)
app.use('/api/transactions', transactionsRouter)
app.use('/api/users', userRouter)
app.use('/api/qrcode', qrCodeRouter)
app.use('/api/cron', cronRouter)

handleCron()

export { app }
