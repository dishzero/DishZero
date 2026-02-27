import express, { Request, Response } from 'express'
import { CustomRequest, verifyFirebaseToken } from '../middlewares/auth'
import { verifyIfUserAdmin } from '../services/users'
import { getAllTransactions, getUserTransactions } from '../services/transactions'
import logger from '../utils/logger'

async function getTransactions(req: Request, res: Response) {
    const userClaims = (req as CustomRequest).firebase
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
                res.status(500).json({ error: 'internal_server_error', message: err.message })
            }
        } else {
            return res.status(403).json({ error: 'forbidden' })
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
        res.status(500).json({ error: 'internal_server_error' })
        return
    }

    res.status(200).json({ transactions })
    return
}

const router = express.Router()

router.get('/', verifyFirebaseToken, getTransactions)

export { router as transactionsRouter }
