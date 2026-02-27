import express, { Request, Response } from 'express'
import { verifyFirebaseToken } from '@/middlewares'
import { FirebaseRequest } from '@/firebase'
import { verifyIfUserAdmin } from '@/services/users'
import { getAllTransactions, getUserTransactions } from '@/services/transactions'
import logger from '@/logger'
import { FORBIDDEN_ERROR_RESPONSE, INTERNAL_SERVER_ERROR_RESPONSE } from '@/constants'

async function getTransactions(req: Request, res: Response) {
    const userClaims = (req as FirebaseRequest).firebase
    const all = req.query['all']?.toString()
    let transactions
    if (all === 'true') {
        if (verifyIfUserAdmin(userClaims)) {
            try {
                transactions = await getAllTransactions()
                return res.status(200).json({ transactions })
            } catch (err: any) {
                logger.error({
                    reqId: req.id,
                    error: err.message,
                })
                return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
            }
        } else {
            return res.status(403).json(FORBIDDEN_ERROR_RESPONSE)
        }
    }

    try {
        transactions = await getUserTransactions(userClaims)
    } catch (e) {
        logger.error({
            reqId: req.id,
            error: e,
            message: 'Error when fetching transactions from firebase',
        })
        res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
        return
    }

    res.status(200).json({ transactions })
    return
}

const router = express.Router()

router.get('/', verifyFirebaseToken, getTransactions)

export { router as transactionsRouter }
