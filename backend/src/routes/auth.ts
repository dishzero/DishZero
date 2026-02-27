import express, { Request, Response } from 'express'
import { auth, db } from '../internal/firebase'
import { getUserByEmail } from '../services/users'
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier'
import logger from '../utils/logger'

async function login(req: Request, res: Response) {
    let decodedToken
    const idToken = req.body.idToken?.toString()
    if (!idToken) {
        return res.status(401).send({ error: 'unauthorized_request' })
    }

    try {
        decodedToken = await auth.verifyIdToken(idToken)
    } catch (error) {
        logger.error({
            error,
            message: 'Error when verifying firebase id token',
            statusCode: 401,
        })
        return res.status(401).send({ error: 'unauthorized_request' })
    }

    const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 days
    try {
        const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn })
        const user = await getUser(decodedToken)
        res.cookie('session', sessionCookie, { maxAge: expiresIn, httpOnly: true, secure: true })
        return res.status(200).json({
            session: sessionCookie,
            user,
        })
    } catch (error) {
        logger.error({
            error,
            message: 'Error when creating firebase session cookie',
        })
        return res.status(401).send({ error: 'unauthorized_request' })
    }
}

async function logout(req: Request, res: Response) {
    const sessionCookie = req.header('session-token') || req.cookies.session || ''
    res.clearCookie('session')
    auth.verifySessionCookie(sessionCookie)
        .then((decodedClaims) => {
            return auth.revokeRefreshTokens(decodedClaims.sub)
        })
        .then(() => {
            res.status(200).send({ status: 'success' })
        })
        .catch((error) => {
            logger.error({
                error,
                message: 'Error when revoking firebase session cookie',
            })
            res.status(401).send({ error: 'unauthorized_request' })
        })
}

async function getUser(decodedIdToken: DecodedIdToken) {
    const email = decodedIdToken.email
    if (!email) {
        throw new Error('Email is not provided')
    }
    const userExists = await getUserByEmail(email)

    if (!userExists) {
        const User = {
            email,
            role: 'customer',
        }
        await auth.setCustomUserClaims(decodedIdToken.sub, { role: 'customer' })
        try {
            db.collection('users').doc(decodedIdToken.uid).set(User)
            const retrieveUser = await getUserByEmail(email)
            return retrieveUser
        } catch (error) {
            logger.error({
                error,
                message: 'Error when creating user in firebase collection',
            })
            throw new Error('Error when creating user in firebase collection')
        }
    }

    return userExists
}

const router = express.Router()

router.post('/login', login)
router.post('/logout', logout)

export { router as authRouter }
