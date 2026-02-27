import express, { Request, Response } from 'express'
import { verifyFirebaseToken } from '../middlewares'
import { FirebaseRequest } from '../firebase'
import { verifyIfUserAdmin } from '../services/users'
import logger from '../logger'
import { convertToMT, convertToUTC, validateEmailFields, validateUpdateEmailBody } from '../services/cron/cronUtils'
import {
    EmailClient,
    getEmailCron,
    initializeEmailCron,
    isEmailCronEnabled,
    setEmailCron,
} from '../services/cron/emailCron'
import {
    fetchEmailCron,
    setEmailCronEnabled,
    setEmailCronExpression,
    setEmailTemplate,
    updateEmailConfig,
} from '../services/cron'
import { BAD_REQUEST_ERROR_RESPONSE, FORBIDDEN_ERROR_RESPONSE, INTERNAL_SERVER_ERROR_RESPONSE } from '../constants'

function stopCron() {
    const cron = getEmailCron()
    if (cron) {
        cron.stop()
        setEmailCron(null)
    }
}

async function getEmail(req: Request, res: Response) {
    const userClaims = (req as FirebaseRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        return res.status(403).json(FORBIDDEN_ERROR_RESPONSE)
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
            reqId: req.id,
            error: error,
            message: 'Error when fetching cron from firebase',
        })
        return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
    }
}

async function updateEmail(req: Request, res: Response) {
    const userClaims = (req as FirebaseRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        return res.status(403).json(FORBIDDEN_ERROR_RESPONSE)
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
        await updateEmailConfig(body)
        return res.status(200).json({ message: 'email_updated' })
    } catch (error: any) {
        logger.error({
            reqId: req.id,
            error: error,
            message: 'Error when fetching cron from firebase',
        })
        return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
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

    const userClaims = (req as FirebaseRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        return res.status(403).json(FORBIDDEN_ERROR_RESPONSE)
    }

    try {
        await setEmailCronEnabled(enabled)
        return res.status(200).json({ enabled })
    } catch (error: any) {
        logger.error({
            reqId: req.id,
            error: error,
            message: 'Error when fetching cron from firebase',
        })
        return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
    }
}

async function updateEmailTemplate(req: Request, res: Response) {
    const userClaims = (req as FirebaseRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        return res.status(403).json(FORBIDDEN_ERROR_RESPONSE)
    }

    const template = req.body.template
    const subject = template?.subject
    const body = template?.body
    const senderEmail = template?.senderEmail
    if (!template || !subject || !body) {
        return res.status(400).json(BAD_REQUEST_ERROR_RESPONSE)
    }

    await setEmailTemplate({
        senderEmail,
        subject,
        body,
    })

    return res.status(200).json({ subject, body })
}

async function updateEmailCronExpression(req: Request, res: Response) {
    const userClaims = (req as FirebaseRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        return res.status(403).json(FORBIDDEN_ERROR_RESPONSE)
    }

    const exprTime = req.body.exprTime.split(':')
    const hours = parseInt(exprTime[0])
    const minutes = parseInt(exprTime[1])
    const days = req.body.days
    const daysArr = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    if (!validateUpdateEmailBody(days, daysArr)) {
        return res.status(400).json(BAD_REQUEST_ERROR_RESPONSE)
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

    await setEmailCronExpression(cronExpression)

    const enabled = await isEmailCronEnabled()
    if (enabled) {
        stopCron()
        initializeEmailCron({ cronExpression: cronExpression }, EmailClient.AWS)
    }

    return res.status(200).json({ days })
}

async function stopEmailCron(req: Request, res: Response) {
    const userClaims = (req as FirebaseRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        return res.status(403).json(FORBIDDEN_ERROR_RESPONSE)
    }

    stopCron()

    await setEmailCronEnabled(false)

    return res.status(200).json({ message: 'stopped email cron' })
}

async function startEmailCron(req: Request, res: Response) {
    const userClaims = (req as FirebaseRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        return res.status(403).json(FORBIDDEN_ERROR_RESPONSE)
    }

    stopCron()

    const data = await fetchEmailCron()

    if (!data) {
        return res.status(500).json({ error: 'internal_server_error' })
    }

    initializeEmailCron({ cronExpression: data.expression }, EmailClient.AWS)

    await setEmailCronEnabled(true)

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
