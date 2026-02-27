import express, { Request, Response } from 'express'
import { verifyFirebaseToken } from '../middlewares/auth'
import { verifyIfUserAdmin } from '../services/users'
import logger from '../utils/logger'
import { CustomRequest } from '../middlewares/auth'
import { createQrCodeInDatabase, deleteQrCodeFromDatabase, getAllQrCodes, getQrCode } from '../services/qrCode'
import {
    BAD_REQUEST_ERROR_RESPONSE,
    FORBIDDEN_ERROR_RESPONSE,
    INTERNAL_SERVER_ERROR_RESPONSE,
    QR_CODE_NOT_FOUND_ERROR_RESPONSE,
} from '../constants'

async function getQrCodes(req: Request, res: Response) {
    const userClaims = (req as CustomRequest).firebase
    const qid = req.query['qid']?.toString()

    if (!qid) {
        if (!verifyIfUserAdmin(userClaims)) {
            return res.status(403).json(FORBIDDEN_ERROR_RESPONSE)
        }

        const codes = await getAllQrCodes()
        return res.status(200).json({ qrCodes: codes })
    }

    try {
        const qrCode = await getQrCode(qid.toString())
        if (!qrCode) {
            return res.status(404).json(QR_CODE_NOT_FOUND_ERROR_RESPONSE)
        }
        return res.status(200).json({ qrCode: qrCode })
    } catch (error: any) {
        logger.error({
            reqId: req.id,
            message: 'Error when retrieving qr code',
            error,
        })
        return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
    }
}

async function createQrCode(req: Request, res: Response) {
    const userClaims = (req as CustomRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        return res.status(403).json(FORBIDDEN_ERROR_RESPONSE)
    }

    try {
        const qrCode = await createQrCodeInDatabase(req.body.qrCode, false)
        return res.status(201).json({ qrCode })
    } catch (error: any) {
        logger.error({
            reqId: req.id,
            error,
            message: 'Error when creating qr code in database',
        })
        return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
    }
}

async function updateQrCode(req: Request, res: Response) {
    const userClaims = (req as CustomRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        return res.status(403).json(FORBIDDEN_ERROR_RESPONSE)
    }

    const existingQrCode = await getQrCode(req.body.qrCode.qid.toString())
    if (!existingQrCode) {
        return res.status(404).json(QR_CODE_NOT_FOUND_ERROR_RESPONSE)
    }

    try {
        const qrCode = await createQrCodeInDatabase(req.body.qrCode, true)
        return res.status(200).json({ qrCode })
    } catch (error: any) {
        logger.error({
            reqId: req.id,
            error,
            message: 'Error when creating qr code in database',
        })
        return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
    }
}

async function deleteQrCode(req: Request, res: Response) {
    const userClaims = (req as CustomRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        return res.status(403).json(FORBIDDEN_ERROR_RESPONSE)
    }

    const qid = req.query['qid']?.toString()
    if (!qid) {
        return res.status(400).json(BAD_REQUEST_ERROR_RESPONSE)
    }

    try {
        await deleteQrCodeFromDatabase(qid)
        return res.status(200).json({ message: 'deleted qr code' })
    } catch (error: any) {
        logger.error({
            reqId: req.id,
            error,
            message: 'Error when deleting qr code in database',
        })
        return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
    }
}

const router = express.Router()

router.get('/', verifyFirebaseToken, getQrCodes)
router.post('/create', verifyFirebaseToken, createQrCode)
router.post('/update', verifyFirebaseToken, updateQrCode)
router.post('/delete', verifyFirebaseToken, deleteQrCode)

export { router as qrCodeRouter }
