import express from 'express'
import { login, logout } from '../controllers/auth'

const router = express.Router()

router.post('/login', login)
router.post('/logout', logout)

export { router as authRouter }
