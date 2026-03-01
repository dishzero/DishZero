import express, { Request, Response } from 'express';

import { BAD_REQUEST_ERROR_RESPONSE, FORBIDDEN_ERROR_RESPONSE, QR_CODE_NOT_FOUND_ERROR_RESPONSE } from '@/constants';
import { FirebaseRequest } from '@/firebase';
import { asyncRouteHandler, verifyAuthorizedRoles, verifyFirebaseToken } from '@/middlewares';
import { createQrCodeInDatabase, deleteQrCodeFromDatabase, getAllQrCodes, getQrCode } from '@/services/qrCode';

async function getQrCodes(req: Request, res: Response) {
    const userClaims = (req as FirebaseRequest).firebase;
    const qid = req.query['qid']?.toString();

    if (!qid) {
        // TODO: we should split out the "all" case to a different route for seperation of concerns and so we can use the verifyAuthorizedRoles(['admin']) middleware here
        if (userClaims.role !== 'admin') {
            return res.status(403).json(FORBIDDEN_ERROR_RESPONSE);
        }

        const codes = await getAllQrCodes();
        return res.status(200).json({ qrCodes: codes });
    }

    const qrCode = await getQrCode(qid.toString());
    if (!qrCode) {
        return res.status(404).json(QR_CODE_NOT_FOUND_ERROR_RESPONSE);
    }
    return res.status(200).json({ qrCode: qrCode });
}

async function createQrCode(req: Request, res: Response) {
    const qrCode = await createQrCodeInDatabase(req.body.qrCode, false);
    return res.status(201).json({ qrCode });
}

async function updateQrCode(req: Request, res: Response) {
    const existingQrCode = await getQrCode(req.body.qrCode.qid.toString());
    if (!existingQrCode) {
        return res.status(404).json(QR_CODE_NOT_FOUND_ERROR_RESPONSE);
    }

    const qrCode = await createQrCodeInDatabase(req.body.qrCode, true);
    return res.status(200).json({ qrCode });
}

async function deleteQrCode(req: Request, res: Response) {
    const qid = req.query['qid']?.toString();
    if (!qid) {
        return res.status(400).json(BAD_REQUEST_ERROR_RESPONSE);
    }

    await deleteQrCodeFromDatabase(qid);
    return res.status(200).json({ message: 'deleted qr code' });
}

const router = express.Router();

router.get('/', verifyFirebaseToken, asyncRouteHandler(getQrCodes));
router.post('/create', verifyFirebaseToken, verifyAuthorizedRoles(['admin']), asyncRouteHandler(createQrCode));
router.post('/update', verifyFirebaseToken, verifyAuthorizedRoles(['admin']), asyncRouteHandler(updateQrCode));
router.post('/delete', verifyFirebaseToken, verifyAuthorizedRoles(['admin']), asyncRouteHandler(deleteQrCode));

export { router as qrCodeRouter };
