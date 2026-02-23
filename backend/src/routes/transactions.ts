import express from 'express'
import { getTransactions } from '../controllers/transactions'
import { verifyFirebaseToken } from '../middlewares/auth'

const router = express.Router()

router.get('/', verifyFirebaseToken, getTransactions)

export { router as transactionsRouter }
