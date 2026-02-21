import express from 'express'
import { verifyFirebaseToken } from '../middlewares/auth'
import { createQrCode, deleteQrCode, getQrCodes, updateQrCode } from '../controllers/qrCode'

const router = express.Router()

router.get('/', verifyFirebaseToken, getQrCodes)
router.post('/create', verifyFirebaseToken, createQrCode)
router.post('/update', verifyFirebaseToken, updateQrCode)
router.post('/delete', verifyFirebaseToken, deleteQrCode)

export { router as qrCodeRouter }
