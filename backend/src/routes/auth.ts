import express, { Request, Response } from 'express'
import { ensureUserExistsForDecodedToken } from '@/services/users'
import { auth } from '@/firebase'
import logger from '@/logger'
import {
    INTERNAL_SERVER_ERROR_RESPONSE,
    SUCCESS_STATUS_RESPONSE,
    UNAUTHORIZED_REQUEST_ERROR_RESPONSE,
} from '@/constants'

async function login(req: Request, res: Response) {
    let decodedToken
    const idToken = req.body.idToken?.toString()
    if (!idToken) {
        return res.status(401).send(UNAUTHORIZED_REQUEST_ERROR_RESPONSE)
    }

    try {
        decodedToken = await auth.verifyIdToken(idToken)
    } catch (error) {
        logger.error({
            reqId: req.id,
            error,
            message: 'Error when verifying firebase id token',
        })
        return res.status(401).send(UNAUTHORIZED_REQUEST_ERROR_RESPONSE)
    }

    const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 days
    try {
        const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn })
        const user = await ensureUserExistsForDecodedToken(decodedToken)
        res.cookie('session', sessionCookie, { maxAge: expiresIn, httpOnly: true, secure: true })
        return res.status(200).json({
            session: sessionCookie,
            user,
        })
    } catch (error) {
        logger.error({
            reqId: req.id,
            error,
            message: 'Error when creating firebase session cookie',
        })
        return res.status(401).send(UNAUTHORIZED_REQUEST_ERROR_RESPONSE)
    }
}

async function logout(req: Request, res: Response) {
    const sessionCookie = req.header('session-token') || req.cookies.session || ''
    res.clearCookie('session')
    if (!sessionCookie) {
        return res.status(401).send(UNAUTHORIZED_REQUEST_ERROR_RESPONSE)
    }

    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie)
        await auth.revokeRefreshTokens(decodedClaims.sub)
        return res.status(200).send(SUCCESS_STATUS_RESPONSE)
    } catch (error) {
        logger.error({
            reqId: req.id,
            error,
            message: 'Error when revoking firebase session cookie',
        })
        return res.status(500).send(INTERNAL_SERVER_ERROR_RESPONSE)
    }
}

const router = express.Router()

router.post('/login', login)
router.post('/logout', logout)

export { router as authRouter }
