import express, { Request, Response } from 'express'
import {
    getAllUsers,
    getUserById,
    getUsersWithRole,
    modifyUserData,
    modifyUserRole,
    verifyRole,
    verifyType,
} from '../services/users'
import { auth } from '../internal/firebase'
import { User } from '../models/user'
import logger from '../utils/logger'
import { CustomRequest, verifyFirebaseToken } from '../middlewares/auth'

async function getUsers(req: Request, res: Response) {
    const role = req.query['role']?.toString()
    const id = req.query['id']?.toString()
    const userClaims = (req as CustomRequest).firebase
    if (userClaims.role !== 'admin') {
        return res.status(403).json({ error: 'forbidden' })
    }

    if (role && verifyRole(role)) {
        try {
            const users = await getUsersWithRole(role)
            return res.status(200).json({ users })
        } catch (error) {
            logger.error({
                error: error,
                message: 'Error when fetching users from firebase',
                statusCode: 500,
            })
            return res.status(500).json({ error: 'internal_server_error' })
        }
    } else if (id) {
        try {
            const user = await getUserById(id)
            return res.status(200).json({ user })
        } catch (error) {
            logger.error({
                error: error,
                message: 'Error when fetching user from firebase',
                statusCode: 500,
            })
            return res.status(500).json({ error: 'internal_server_error' })
        }
    } else {
        try {
            const users = await getAllUsers()
            return res.status(200).json({ users })
        } catch (error) {
            logger.error({
                error: error,
                message: 'Error when fetching users from firebase',
                statusCode: 500,
            })
            return res.status(500).json({ error: 'internal_server_error' })
        }
    }
}

async function verifyUserSession(req: Request, res: Response) {
    const userClaims = (req as CustomRequest).firebase
    const user = await auth.getUser(userClaims.uid)
    if (!user) {
        return res.status(404).json({ error: 'user_not_found' })
    }

    const userData = await getUserById(userClaims.uid)
    return res.status(200).json({ user: { ...user, ...userData } })
}

async function updateUser(req: Request, res: Response) {
    const userClaims = (req as CustomRequest).firebase
    const type = req.params['type']?.toString()
    if (type && verifyType(type)) {
        if (type === 'role') {
            if (userClaims.role !== 'admin') {
                return res.status(403).json({ error: 'forbidden' })
            }

            try {
                const user: User = req.body.user
                if (!user) {
                    throw new Error('No user provided')
                }

                await modifyUserRole(user, userClaims)

                return res.status(200).json({ status: 'success' })
            } catch (error) {
                logger.error({
                    error,
                    message: 'Error updating user role',
                    statusCode: 500,
                })
                return res.status(500).json({ error: 'internal_server_error' })
            }
        } else if (type === 'user') {
            try {
                const user: User = req.body.user
                if (!user) {
                    return res.status(400).json({ error: 'no_user_provided' })
                }

                await modifyUserData(user, userClaims)

                return res.status(200).json({ status: 'success' })
            } catch (error: any) {
                logger.error({
                    error: error.message,
                    message: 'Error updating user information',
                    statusCode: 500,
                })
                return res.status(500).json({ error: 'internal_server_error', message: error.message })
            }
        }
    } else {
        return res.status(400).json({ error: 'invalid_type' })
    }
}

const router = express.Router()

router.get('/', verifyFirebaseToken, getUsers)
router.get('/session', verifyFirebaseToken, verifyUserSession)
router.post('/modify/:type', verifyFirebaseToken, updateUser)

export { router as userRouter }
