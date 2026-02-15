import { Request, Response, NextFunction } from 'express'
import * as dotenv from 'dotenv'
import { auth } from '../internal/firebase'
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier'
import Logger from '../utils/logger'
import { getUserById } from '../services/users'
dotenv.config()

// Define the custom request object
export interface CustomRequest extends Request {
    firebase: DecodedIdToken
}

/**
 * verifies the firebase session token in the request header
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns decoded firebase token in the request object
 */
export const verifyFirebaseToken = (req: Request, res: Response, next: NextFunction) => {
    const sessionCookies = req.header('session-token') || req.cookies?.session
    if (!sessionCookies) {
        Logger.error({
            error: 'No session token or cookie provided',
            statusCode: 401,
        })
        return res.status(401).json({ error: 'no_session_token_provided' })
    }
    auth.verifySessionCookie(sessionCookies, true /** check revoked */)
        .then((decodedClaims) => {
            ;(req as CustomRequest).firebase = decodedClaims
        })
        .then(async () => {
            // fetch the user from firebase and update the role in the request object
            // This logic will overide the role in the firebase session token with the role in the database
            let user = await getUserById((req as CustomRequest).firebase.uid)
            if (!user) {
                Logger.error({
                    message: 'User not found',
                    statusCode: 404,
                })
                return res.status(400).json({ error: 'user_not_found' })
            }
            ;(req as CustomRequest).firebase.role = user.role
            next()
        })
        .catch((error) => {
            Logger.error({
                error,
                message: 'Error when verifying firebase session token',
                statusCode: 401,
            })
            return res.status(401).json({ error: 'invalid_session_token' })
        })
}
