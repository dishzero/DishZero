import { Request, Response, NextFunction } from 'express'
import * as dotenv from 'dotenv'
import logger from './logger'
import { getUserById } from './services/users'
import { auth, FirebaseRequest } from './firebase'
import { INTERNAL_SERVER_ERROR_RESPONSE } from './constants'
dotenv.config()

// Define the custom request object

/**
 * verifies the firebase session token in the request header
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns decoded firebase token in the request object
 */
export const verifyFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
    const sessionCookies = req.header('session-token') || req.cookies?.session
    if (!sessionCookies) {
        return res.status(401).json({ error: 'no_session_token_provided' })
    }
    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookies, true)
        ;(req as FirebaseRequest).firebase = decodedClaims
        let user = await getUserById((req as FirebaseRequest).firebase.uid)
        if (!user) {
            return res.status(404).json({ error: 'user_not_found' })
        }
        ;(req as FirebaseRequest).firebase.role = user.role
        next()
    } catch (error) {
        logger.error({
            reqId: req.id,
            error,
            message: 'Error when verifying firebase session token',
        })
        return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
    }
}
