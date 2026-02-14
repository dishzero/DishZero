import express from 'express'
import { verifyFirebaseToken } from '../middlewares/auth'
import {
    enableEmail,
    getEmail,
    startEmailCron,
    stopEmailCron,
    updateEmail,
    updateEmailCronExpression,
    updateEmailTemplate,
} from '../controllers/cron/email'

const router = express.Router()

router.get('/email', verifyFirebaseToken, getEmail)
router.post('/email/update', verifyFirebaseToken, updateEmail)
router.post('/email/enable', verifyFirebaseToken, enableEmail)
router.post('/email/template', verifyFirebaseToken, updateEmailTemplate)
router.post('/email/expression', verifyFirebaseToken, updateEmailCronExpression)
router.post('/email/stop', verifyFirebaseToken, stopEmailCron)
router.post('/email/start', verifyFirebaseToken, startEmailCron)

export { router as cronRouter }
