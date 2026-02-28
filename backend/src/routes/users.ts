import express, { Request, Response } from 'express'
import {
    getAllUsers,
    getUserById,
    getUsersWithRole,
    modifyUserData,
    modifyUserRole,
    verifyRole,
    verifyType,
    User,
} from '@/services/users'
import logger from '@/logger'
import { verifyAuthorizedRoles, verifyFirebaseToken } from '@/middlewares'
import { auth, FirebaseRequest } from '@/firebase'
import { FORBIDDEN_ERROR_RESPONSE, INTERNAL_SERVER_ERROR_RESPONSE, SUCCESS_STATUS_RESPONSE } from '@/constants'

async function getUsers(req: Request, res: Response) {
    const role = req.query['role']?.toString()
    const id = req.query['id']?.toString()
    if (role && verifyRole(role)) {
        try {
            const users = await getUsersWithRole(role)
            return res.status(200).json({ users })
        } catch (error) {
            logger.error({
                reqId: req.id,
                error: error,
                message: 'Error when fetching users from firebase',
            })
            return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
        }
    } else if (id) {
        try {
            const user = await getUserById(id)
            return res.status(200).json({ user })
        } catch (error) {
            logger.error({
                reqId: req.id,
                error: error,
                message: 'Error when fetching user from firebase',
            })
            return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
        }
    } else {
        try {
            const users = await getAllUsers()
            return res.status(200).json({ users })
        } catch (error) {
            logger.error({
                reqId: req.id,
                error: error,
                message: 'Error when fetching users from firebase',
            })
            return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
        }
    }
}

// TODO: this should be at /api/auth/me or /api/auth/session
async function verifyUserSession(req: Request, res: Response) {
    const userClaims = (req as FirebaseRequest).firebase
    const user = await auth.getUser(userClaims.uid)
    if (!user) {
        return res.status(404).json({ error: 'user_not_found' })
    }

    const userData = await getUserById(userClaims.uid)
    return res.status(200).json({ user: { ...user, ...userData } })
}

async function updateUser(req: Request, res: Response) {
    const userClaims = (req as FirebaseRequest).firebase
    const type = req.params['type']?.toString()
    if (type && verifyType(type)) {
        if (type === 'role') {
            // TODO: we should split out the "admin" case to a different route for seperation of concerns and so we can use the verifyAuthorizedRoles(['admin']) middleware here
            if (userClaims.role !== 'admin') {
                return res.status(403).json(FORBIDDEN_ERROR_RESPONSE)
            }

            try {
                const user: User = req.body.user
                if (!user) {
                   return res.status(400).json({ error: 'no_user_provided' })
                }

                await modifyUserRole(user, userClaims)

                return res.status(200).json(SUCCESS_STATUS_RESPONSE)
            } catch (error) {
                logger.error({
                    reqId: req.id,
                    error,
                    message: 'Error updating user role',
                })
                return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
            }
        } else if (type === 'user') {
            try {
                const user: User = req.body.user
                if (!user) {
                    return res.status(400).json({ error: 'no_user_provided' })
                }

                await modifyUserData(user, userClaims)

                return res.status(200).json(SUCCESS_STATUS_RESPONSE)
            } catch (error: any) {
                logger.error({
                    reqId: req.id,
                    error: error.message,
                    message: 'Error updating user information',
                })
                return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
            }
        }
    } else {
        return res.status(400).json({ error: 'invalid_type' })
    }
}

const router = express.Router()

router.get('/', verifyFirebaseToken, verifyAuthorizedRoles(['admin']), getUsers)
router.get('/session', verifyFirebaseToken, verifyUserSession)
router.post('/modify/:type', verifyFirebaseToken, updateUser)

export { router as userRouter }
