import express, { Request, Response } from 'express';

import { SUCCESS_STATUS_RESPONSE, UNAUTHORIZED_REQUEST_ERROR_RESPONSE } from '@/constants';
import { auth } from '@/firebase';
import logger from '@/logger';
import { asyncRouteHandler } from '@/middlewares';
import { ensureUserExistsForDecodedToken } from '@/services/users';

async function login(req: Request, res: Response) {
    let decodedToken;
    const idToken = req.body.idToken?.toString();
    if (!idToken) {
        return res.status(401).send(UNAUTHORIZED_REQUEST_ERROR_RESPONSE);
    }

    try {
        decodedToken = await auth.verifyIdToken(idToken);
    } catch (err) {
        logger.error({
            reqId: req.id,
            err,
        });
        // TODO: How can we differentiate an invalid token from something that should return a 500?
        return res.status(401).send(UNAUTHORIZED_REQUEST_ERROR_RESPONSE);
    }

    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    const user = await ensureUserExistsForDecodedToken(decodedToken);
    res.cookie('session', sessionCookie, { maxAge: expiresIn, httpOnly: true, secure: true });
    return res.status(200).json({
        session: sessionCookie,
        user,
    });
}

async function logout(req: Request, res: Response) {
    const sessionCookie = req.header('session-token') || req.cookies.session || '';
    res.clearCookie('session');
    if (!sessionCookie) {
        return res.status(401).send(UNAUTHORIZED_REQUEST_ERROR_RESPONSE);
    }

    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie);
        await auth.revokeRefreshTokens(decodedClaims.sub);
        return res.status(200).send(SUCCESS_STATUS_RESPONSE);
    } catch (err) {
        logger.error({
            reqId: req.id,
            err,
        });
        // TODO: How can we differentiate an invalid token from something that should return a 500?
        return res.status(401).send(UNAUTHORIZED_REQUEST_ERROR_RESPONSE);
    }
}

const router = express.Router();

router.post('/login', asyncRouteHandler(login));
router.post('/logout', asyncRouteHandler(logout));

export { router as authRouter };
