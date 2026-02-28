import { Request, Response, NextFunction } from 'express'
import * as dotenv from 'dotenv'
import logger from '@/logger'
import { getUserById } from '@/services/users'
import { auth, FirebaseRequest } from '@/firebase'
import { FORBIDDEN_ERROR_RESPONSE, UNAUTHORIZED_REQUEST_ERROR_RESPONSE } from '@/constants'
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
    // TODO: decide on a single approach
    const sessionCookies = req.header('session-token') || req.cookies?.session
    if (!sessionCookies) {
        return res.status(401).json(UNAUTHORIZED_REQUEST_ERROR_RESPONSE)
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
        // TODO: How can we differentiate an invalid token from something that should return a 500?
        return res.status(401).json(UNAUTHORIZED_REQUEST_ERROR_RESPONSE)
    }
}

/**
 * Returns a middleware that allows only the given roles. Must be used after verifyFirebaseToken.
 * Returns 403 if the user's role is not in allowedRoles.
 */
export const verifyAuthorizedRoles = (allowedRoles: string[]) => (req: Request, res: Response, next: NextFunction) => {
    const role = (req as FirebaseRequest).firebase.role
    if (!allowedRoles.includes(role)) {
        return res.status(403).json(FORBIDDEN_ERROR_RESPONSE)
    }
    next()
}
