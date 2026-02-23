import express from 'express'
import {
    borrowDish,
    createDish,
    createMultipleDishes,
    addDishType,
    deleteDishes,
    getDishes,
    returnDish,
    updateDishCondition,
    getDishTypes,
    getDishVendors,
    modifyDish,
} from '../controllers/dish'
import { verifyFirebaseToken } from '../middlewares/auth'

const router = express.Router()

router.get('/', verifyFirebaseToken, getDishes)
router.get('/getDishTypes', verifyFirebaseToken, getDishTypes)
router.get('/getDishVendors', verifyFirebaseToken, getDishVendors)
router.post('/createMultipleDishes', verifyFirebaseToken, createMultipleDishes)
router.post('/addDishType', verifyFirebaseToken, addDishType)
router.post('/modifyDish', verifyFirebaseToken, modifyDish)
router.post('/create', verifyFirebaseToken, createDish)
router.post('/borrow', verifyFirebaseToken, borrowDish)
router.post('/return', verifyFirebaseToken, returnDish)
router.post('/delete', verifyFirebaseToken, deleteDishes)
router.post('/condition', verifyFirebaseToken, updateDishCondition)

export { router as dishRouter }
