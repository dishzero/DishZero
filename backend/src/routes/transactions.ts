import express, { Request, Response } from 'express';

import { FORBIDDEN_ERROR_RESPONSE } from '@/constants';
import { FirebaseRequest } from '@/firebase';
import { asyncRouteHandler, verifyFirebaseToken } from '@/middlewares';
import { getAllTransactions, getUserTransactions } from '@/services/transactions';

async function getTransactions(req: Request, res: Response) {
    const userClaims = (req as FirebaseRequest).firebase;
    const all = req.query['all']?.toString();
    if (all === 'true') {
        // TODO: we should split out the "all" case to a different route for seperation of concerns and so we can use the verifyAuthorizedRoles(['admin']) middleware here
        if (userClaims.role !== 'admin') {
            return res.status(403).json(FORBIDDEN_ERROR_RESPONSE);
        }
        const transactions = await getAllTransactions();
        return res.status(200).json({ transactions });
    }

    const transactions = await getUserTransactions(userClaims);
    return res.status(200).json({ transactions });
}

const router = express.Router();

router.get('/', verifyFirebaseToken, asyncRouteHandler(getTransactions));

export { router as transactionsRouter };
