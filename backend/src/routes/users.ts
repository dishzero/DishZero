import express from 'express'
import { verifyFirebaseToken } from '../middlewares/auth'
import { getUsers, updateUser, verifyUserSession } from '../controllers/users'

const router = express.Router()

router.get('/', verifyFirebaseToken, getUsers)
router.get('/session', verifyFirebaseToken, verifyUserSession)
router.post('/modify/:type', verifyFirebaseToken, updateUser)

export { router as userRouter }
