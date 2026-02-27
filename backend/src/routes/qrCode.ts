import express, { Request, Response } from 'express'
import { verifyFirebaseToken } from '../middlewares/auth'
import { verifyIfUserAdmin } from '../services/users'
import Logger from '../utils/logger'
import { CustomRequest } from '../middlewares/auth'
import { createQrCodeInDatabase, deleteQrCodeFromDatabase, getAllQrCodes, getQrCode } from '../services/qrCode'

async function getQrCodes(req: Request, res: Response) {
    const userClaims = (req as CustomRequest).firebase
    const qid = req.query['qid']?.toString()

    if (!qid) {
        if (!verifyIfUserAdmin(userClaims)) {
            Logger.error({
                module: 'qrCode.controller',
                message: 'User is not admin',
                statusCode: 403,
            })
            return res.status(403).json({ error: 'forbidden' })
        }

        const codes = await getAllQrCodes()

        Logger.info({
            module: 'qrCode.controller',
            function: 'getQrCodes',
            message: 'retrieved all qr codes',
            status: 200,
        })

        return res.status(200).json({ qrCodes: codes })
    }

    try {
        const qrCode = await getQrCode(qid.toString())
        if (!qrCode) {
            Logger.error({
                message: 'qr code does not exist',
                statusCode: 404,
                module: 'qrCode.controller',
                function: 'getQRCodes',
            })
            return res.status(400).json({ error: 'qr_code_not_found' })
        }
        Logger.info({
            message: 'retrieved qrCode',
            module: 'qrCode.controller',
            function: 'getQRCodes',
        })
        return res.status(200).json({ qrCode: qrCode })
    } catch (error: any) {
        Logger.error({
            message: 'Error when retrieving qr code',
            error,
            statusCode: 500,
            module: 'qrCode.controller',
            function: 'getQRCodes',
        })
        return res.status(500).json({ error: 'internal_server_error', message: error.message })
    }
}

async function createQrCode(req: Request, res: Response) {
    const userClaims = (req as CustomRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        Logger.error({
            module: 'qrCode.controller',
            message: 'User is not admin',
            statusCode: 403,
        })
        return res.status(403).json({ error: 'forbidden' })
    }

    try {
        const qrCode = await createQrCodeInDatabase(req.body.qrCode, false)
        return res.status(201).json({ qrCode })
    } catch (error: any) {
        Logger.error({
            module: 'qrCode.controller',
            error,
            message: 'Error when creating qr code in database',
            statusCode: 500,
        })
        return res.status(500).json({ error: 'internal_server_error', message: error.message })
    }
}

async function updateQrCode(req: Request, res: Response) {
    const userClaims = (req as CustomRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        Logger.error({
            module: 'qrCode.controller',
            message: 'User is not admin',
            statusCode: 403,
        })
        return res.status(403).json({ error: 'forbidden' })
    }

    const existingQrCode = await getQrCode(req.body.qrCode.qid.toString())
    if (!existingQrCode) {
        Logger.error({
            module: 'qrCode.services',
            message: 'qrCode does not exist',
            status: 500,
        })
        return res.status(500).json({ error: 'internal_server_error', message: 'qr code does not exist' })
    }

    try {
        const qrCode = await createQrCodeInDatabase(req.body.qrCode, true)
        return res.status(200).json({ qrCode })
    } catch (error: any) {
        Logger.error({
            module: 'qrCode.controller',
            error,
            message: 'Error when creating qr code in database',
            statusCode: 500,
        })
        return res.status(500).json({ error: 'internal_server_error', message: error.message })
    }
}

async function deleteQrCode(req: Request, res: Response) {
    const userClaims = (req as CustomRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        Logger.error({
            module: 'qrCode.controller',
            message: 'User is not admin',
            statusCode: 403,
        })
        return res.status(403).json({ error: 'forbidden' })
    }

    const qid = req.query['qid']?.toString()
    if (!qid) {
        Logger.error({
            module: 'qrCOde.controller',
            message: 'No qid provided',
            statusCode: 400,
        })
        return res.status(400).json({ error: 'bad_request' })
    }

    try {
        await deleteQrCodeFromDatabase(qid)
        return res.status(200).json({ message: 'deleted qr code' })
    } catch (error: any) {
        Logger.error({
            module: 'qrCode.controller',
            error,
            message: 'Error when creating qr code in database',
            statusCode: 500,
        })
        return res.status(500).json({ error: 'internal_server_error', message: error.message })
    }
}

const router = express.Router()

router.get('/', verifyFirebaseToken, getQrCodes)
router.post('/create', verifyFirebaseToken, createQrCode)
router.post('/update', verifyFirebaseToken, updateQrCode)
router.post('/delete', verifyFirebaseToken, deleteQrCode)

export { router as qrCodeRouter }
