import express, { Request, Response } from 'express'
import { verifyFirebaseToken } from '../middlewares/auth'
import { CustomRequest } from '../middlewares/auth'
import { verifyIfUserAdmin } from '../services/users'
import logger from '../utils/logger'
import { db } from '../internal/firebase'
import nodeConfig from 'config'
import { convertToMT, convertToUTC, validateEmailFields, validateUpdateEmailBody } from '../services/cron/email'
import { EmailClient, getEmailCron, initializeEmailCron, isEmailCronEnabled, setEmailCron } from '../cron/email'

export async function fetchEmailCron() {
    const snapshot = await db.collection(nodeConfig.get('collections.cron')).doc('email').get()
    if (!snapshot.exists) {
        throw new Error('Cron does not exist')
    }
    return snapshot.data()
}

async function enableEmailCron(enabled: boolean) {
    await db.collection(nodeConfig.get('collections.cron')).doc('email').update({
        enabled: enabled,
    })
}

function stopCron() {
    const cron = getEmailCron()
    if (cron) {
        cron.stop()
        setEmailCron(null)
    }
}

async function getEmail(req: Request, res: Response) {
    const userClaims = (req as CustomRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        return res.status(403).json({ error: 'forbidden' })
    }

    try {
        const cron = await fetchEmailCron()

        const utcExpr = cron?.expression.split(' ')
        let days = utcExpr[utcExpr.length - 1]
        if (days.length > 3) {
            days = days.split(',')
        } else {
            days = [days]
        }
        const minutes = parseInt(utcExpr[1])
        const hours = parseInt(utcExpr[2])

        const setDays: Array<string> = []
        for (const day of days) {
            const tuple = convertToMT(minutes, hours, day)
            setDays.push(tuple[2])
        }
        const tuple = convertToMT(minutes, hours, 'MON')
        let cronExpression = `0 ${tuple[0]} ${tuple[1]} * * `
        if (setDays.length > 1) {
            cronExpression += setDays.join(',')
        } else {
            cronExpression += setDays[0]
        }
        return res.status(200).json({
            cron: {
                ...cron,
                expression: cronExpression,
            },
        })
    } catch (error: any) {
        logger.error({
            error: error,
            function: 'getEmail',
            message: 'Error when fetching cron from firebase',
            statusCode: 500,
        })
        return res.status(500).json({ error: 'internal_server_error' })
    }
}

async function updateEmail(req: Request, res: Response) {
    const userClaims = (req as CustomRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        return res.status(403).json({ error: 'forbidden' })
    }

    const query = req.query['fields']?.toString()
    if (query === undefined) {
        return res.status(400).json({ error: 'missing_type_parameter' })
    }
    const fields = query.split(',').map((field) => field.trim())
    if (!validateEmailFields(fields)) {
        return res.status(400).json({ error: 'invalid_fields_parameter' })
    }
    const body = req.body
    if (!validateUpdateEmailBody(body, fields)) {
        return res.status(400).json({ error: 'invalid_body' })
    }

    try {
        await db.collection(nodeConfig.get('collections.cron')).doc('email').update(body)
        return res.status(200).json({ message: 'email_updated' })
    } catch (error: any) {
        logger.error({
            error: error,
            function: 'updateEmail',
            message: 'Error when fetching cron from firebase',
            statusCode: 500,
        })
        return res.status(500).json({ error: 'internal_server_error' })
    }
}

async function enableEmail(req: Request, res: Response) {
    const enabled = req.body.enabled
    if (enabled === undefined) {
        return res.status(400).json({ error: 'missing_enabled_parameter' })
    }
    if (typeof enabled !== 'boolean') {
        return res.status(400).json({ error: 'invalid_enabled_parameter' })
    }

    const userClaims = (req as CustomRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        return res.status(403).json({ error: 'forbidden' })
    }

    try {
        await enableEmailCron(enabled)
        return res.status(200).json({ enabled })
    } catch (error: any) {
        logger.error({
            error: error,
            function: 'enableEmail',
            message: 'Error when fetching cron from firebase',
            statusCode: 500,
        })
        return res.status(500).json({ error: 'internal_server_error' })
    }
}

async function updateEmailTemplate(req: Request, res: Response) {
    const userClaims = (req as CustomRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        return res.status(403).json({ error: 'forbidden' })
    }

    const template = req.body.template
    const subject = template?.subject
    const body = template?.body
    const senderEmail = template?.senderEmail
    if (!template || !subject || !body) {
        return res.status(400).json({ error: 'bad_request' })
    }

    await db.collection(nodeConfig.get('collections.cron')).doc('email').update({
        senderEmail,
        subject,
        body,
    })

    return res.status(200).json({ subject, body })
}

async function updateEmailCronExpression(req: Request, res: Response) {
    const userClaims = (req as CustomRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        return res.status(403).json({ error: 'forbidden' })
    }

    const exprTime = req.body.exprTime.split(':')
    const hours = parseInt(exprTime[0])
    const minutes = parseInt(exprTime[1])
    const days = req.body.days
    const daysArr = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    if (!validateUpdateEmailBody(days, daysArr)) {
        return res.status(400).json({ error: 'bad_request' })
    }

    const setDays: Array<string> = []
    for (const day of daysArr) {
        if (days[day]) {
            const tuple = convertToUTC(minutes, hours, day.substring(0, 3).toUpperCase())
            setDays.push(tuple[2])
        }
    }
    const tuple = convertToUTC(minutes, hours, 'MON')
    let cronExpression = `0 ${tuple[0]} ${tuple[1]} * * `
    cronExpression += setDays.join(',')

    await db.collection(nodeConfig.get('collections.cron')).doc('email').update({
        expression: cronExpression,
    })

    const enabled = await isEmailCronEnabled()
    if (enabled) {
        stopCron()
        initializeEmailCron({ cronExpression: cronExpression }, EmailClient.AWS)
    }

    return res.status(200).json({ days })
}

async function stopEmailCron(req: Request, res: Response) {
    const userClaims = (req as CustomRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        return res.status(403).json({ error: 'forbidden' })
    }

    stopCron()

    await db.collection(nodeConfig.get('collections.cron')).doc('email').update({
        enabled: false,
    })

    return res.status(200).json({ message: 'stopped email cron' })
}

async function startEmailCron(req: Request, res: Response) {
    const userClaims = (req as CustomRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        return res.status(403).json({ error: 'forbidden' })
    }

    stopCron()

    const data = await fetchEmailCron()

    if (!data) {
        return res.status(500).json({ message: 'no cron data found' })
    }

    initializeEmailCron({ cronExpression: data.expression }, EmailClient.AWS)

    await db.collection(nodeConfig.get('collections.cron')).doc('email').update({
        enabled: true,
    })

    return res.status(200).json({ message: 'started email cron' })
}

const router = express.Router()

router.get('/email', verifyFirebaseToken, getEmail)
router.post('/email/update', verifyFirebaseToken, updateEmail)
router.post('/email/enable', verifyFirebaseToken, enableEmail)
router.post('/email/template', verifyFirebaseToken, updateEmailTemplate)
router.post('/email/expression', verifyFirebaseToken, updateEmailCronExpression)
router.post('/email/stop', verifyFirebaseToken, stopEmailCron)
router.post('/email/start', verifyFirebaseToken, startEmailCron)

export { router as cronRouter }
