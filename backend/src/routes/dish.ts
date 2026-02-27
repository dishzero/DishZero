import express, { Request, Response } from 'express'
import { verifyFirebaseToken } from '@/middlewares'
import { FirebaseRequest } from '@/firebase'
import {
    DishCondition,
    DishStatus,
    getDish,
    updateBorrowedStatus,
    getAllDishesSimple,
    createDishInDatabase,
    addDishTypeToDatabase,
    updateCondition,
    getAllDishes,
    getUserDishes,
    getUserDishesSimple,
    validateReturnDishRequestBody,
    getDishById,
    validateUpdateConditonRequestBody,
    deleteDish,
    getAllDishTypes,
    batchCreateDishes,
    getAllDishVendors,
    validateModifyDish,
    updateDish,
} from '@/services/dish'
import logger from '@/logger'
import { getUserByEmail, getUserById, verifyIfUserAdmin, verifyIfUserVolunteer } from '@/services/users'
import {
    Transaction,
    registerTransaction,
    getLatestTransactionByTstamp,
    getLatestTransactionByTstampAndDishId,
    updateTransactionReturn,
} from '@/services/transactions'
import { getQrCode } from '@/services/qrCode'
import { User } from '@/services/users'
import {
    BAD_REQUEST_ERROR_RESPONSE,
    FORBIDDEN_ERROR_RESPONSE,
    INTERNAL_SERVER_ERROR_RESPONSE,
    QR_CODE_NOT_FOUND_ERROR_RESPONSE,
} from '@/constants'

const DISH_NOT_FOUND_ERROR_RESPONSE = { error: 'dish_not_found' }
const DISH_RETURNED_RESPONSE = { message: 'dish returned' }

async function getDishes(req: Request, res: Response) {
    const userClaims = (req as FirebaseRequest).firebase
    const id = req.query['id']?.toString()
    const qid = req.query['qid']?.toString()

    if (id) {
        try {
            const dish = await getDishById(id)
            if (!dish) {
                return res.status(404).json(DISH_NOT_FOUND_ERROR_RESPONSE)
            }
            return res.status(200).json({ dish: dish })
        } catch (error: any) {
            logger.error({
                reqId: req.id,
                message: 'Error when retrieving dish',
                error,
            })
            return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
        }
    } else if (qid) {
        try {
            const dish = await getDish(parseInt(qid, 10))
            if (!dish) {
                return res.status(404).json(DISH_NOT_FOUND_ERROR_RESPONSE)
            }
            return res.status(200).json({ dish })
        } catch (error: any) {
            logger.error({
                reqId: req.id,
                message: 'Error when retrieving dish',
                error,
            })
            return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
        }
    }

    const all = req.query['all']?.toString()
    const withEmail = req.query['withEmail']?.toString() === 'true'
    const transaction = req.query['transaction']?.toString()
    let dishes: any

    if (all === 'true') {
        if (!verifyIfUserAdmin(userClaims)) {
            return res.status(403).json(FORBIDDEN_ERROR_RESPONSE)
        }

        try {
            if (transaction === 'true') {
                dishes = await getAllDishes(withEmail)
            } else {
                dishes = await getAllDishesSimple()
            }
        } catch (error: any) {
            logger.error({
                reqId: req.id,
                error,
                message: 'error when getting dishes from firebase',
            })
            return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
        }

        return res.status(200).json({ dishes })
    }

    try {
        if (transaction === 'true') {
            dishes = await getUserDishes(userClaims)
        } else {
            dishes = await getUserDishesSimple(userClaims)
        }

        return res.status(200).json({ dishes })
    } catch (error: any) {
        logger.error({
            reqId: req.id,
            error,
            message: 'error when getting user dishes from firebase',
        })
        return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
    }
}

async function getDishTypes(req: Request, res: Response) {
    const userClaims = (req as FirebaseRequest).firebase

    if (!verifyIfUserAdmin(userClaims)) {
        return res.status(403).json(FORBIDDEN_ERROR_RESPONSE)
    }

    let dishTypes
    try {
        dishTypes = await getAllDishTypes()
    } catch (error: any) {
        logger.error({
            reqId: req.id,
            error,
            message: 'error when getting dish types from firebase',
        })
        return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
    }
    return res.status(200).json({ dishTypes })
}

async function getDishVendors(req: Request, res: Response) {
    const userClaims = (req as FirebaseRequest).firebase

    if (!verifyIfUserAdmin(userClaims)) {
        return res.status(403).json(FORBIDDEN_ERROR_RESPONSE)
    }

    let dishVendors
    try {
        dishVendors = await getAllDishVendors()
    } catch (error: any) {
        logger.error({
            reqId: req.id,
            error,
            message: 'error when getting dish vendors from firebase',
        })
        return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
    }
    return res.status(200).json({ dishVendors })
}

async function deleteDishes(req: Request, res: Response) {
    const userClaims = (req as FirebaseRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        return res.status(403).json(FORBIDDEN_ERROR_RESPONSE)
    }

    const dishIds = req.body.dishIds
    if (!dishIds) {
        return res.status(400).json(BAD_REQUEST_ERROR_RESPONSE)
    }

    try {
        for (const qid of dishIds) {
            const dish = await getDish(parseInt(qid, 10))
            if (!dish) {
                return res.status(400).json(BAD_REQUEST_ERROR_RESPONSE)
            }
            if (dish.status === DishStatus.borrowed) {
                return res.status(400).json(BAD_REQUEST_ERROR_RESPONSE)
            }

            deleteDish(parseInt(qid, 10))
        }

        return res.status(200).json({ message: 'dishes deleted' })
    } catch (error: any) {
        logger.error({
            reqId: req.id,
            error,
            message: 'Error when deleting dishes',
        })
        return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
    }
}

async function createMultipleDishes(req: Request, res: Response) {
    const userClaims = (req as FirebaseRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        return res.status(403).json(FORBIDDEN_ERROR_RESPONSE)
    }

    const dishType = req.body.type
    const dishIdLower = req.body.dishIdLower as number
    const dishIdUpper = req.body.dishIdUpper as number

    try {
        const response = await batchCreateDishes(dishIdLower, dishIdUpper, dishType)
        return res.status(200).json({ response })
    } catch (error: any) {
        logger.error({
            reqId: req.id,
            error,
            message: 'Error when adding dishes to database',
        })
        return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
    }
}

async function createDish(req: Request, res: Response) {
    const userClaims = (req as FirebaseRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        return res.status(403).json(FORBIDDEN_ERROR_RESPONSE)
    }

    try {
        const dish = await createDishInDatabase(req.body.dish)
        return res.status(200).json({ dish })
    } catch (error: any) {
        logger.error({
            reqId: req.id,
            error,
            message: 'Error when creating dish in database',
        })
        return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
    }
}

async function addDishType(req: Request, res: Response) {
    const userClaims = (req as FirebaseRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        return res.status(403).json(FORBIDDEN_ERROR_RESPONSE)
    }

    try {
        const response = await addDishTypeToDatabase(req.body.type)
        return res.status(200).json({ response })
    } catch (error: any) {
        logger.error({
            reqId: req.id,
            error,
            message: 'Error when adding a new dish type to the database',
        })
        return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
    }
}

async function borrowDish(req: Request, res: Response) {
    const qid = req.query['qid']?.toString()
    const email = req.query['email']?.toString()

    if (!qid) {
        return res.status(400).json(BAD_REQUEST_ERROR_RESPONSE)
    }

    const userClaims = (req as FirebaseRequest).firebase

    try {
        const qrCodeExits = await getQrCode(qid)
        if (!qrCodeExits) {
            return res.status(404).json(QR_CODE_NOT_FOUND_ERROR_RESPONSE)
        }

        const associatedDish = await getDish(parseInt(qid, 10))
        if (!associatedDish) {
            return res.status(404).json(DISH_NOT_FOUND_ERROR_RESPONSE)
        }

        if (associatedDish.status === DishStatus.borrowed) {
            return res.status(400).json({ error: 'operation_not_allowed', message: 'Dish already borrowed' })
        }
        const user = email ? ((await getUserByEmail(email!)) as User) : ((await getUserById(userClaims.uid)) as User)
        const transaction: Transaction = {
            dish: {
                qid: associatedDish.qid,
                id: associatedDish.id,
                type: associatedDish.type,
            },
            user: user,
            returned: {
                condition: DishCondition.good,
                timestamp: '',
            },
            timestamp: new Date().toISOString(),
        }

        const newTransaction = await registerTransaction(transaction)
        await updateBorrowedStatus(associatedDish, userClaims, true)

        return res.status(200).json({ transaction: newTransaction })
    } catch (error: any) {
        logger.error({
            reqId: req.id,
            error,
            message: 'Error when borrowing dish',
        })
        return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
    }
}

async function returnDish(req: Request, res: Response) {
    const qid = req.query['qid']?.toString()
    const id = req.query['id']?.toString()
    if (!qid && !id) {
        return res.status(400).json({ error: 'bad_request', message: 'no dish_id provided' })
    }

    const validation = validateReturnDishRequestBody(req.body.returned)
    if (validation.error) {
        return res.status(400).json({ error: 'bad_request', message: 'no values for condition provided' })
    }
    const { condition } = req.body.returned

    const userClaims = (req as FirebaseRequest).firebase
    if (!verifyIfUserAdmin(userClaims) && !verifyIfUserVolunteer(userClaims)) {
        return res.status(403).json(FORBIDDEN_ERROR_RESPONSE)
    }
    try {
        let qrCodeExits
        let associatedDish
        let ongoingTransaction

        if (qid) {
            qrCodeExits = await getQrCode(qid)
            if (!qrCodeExits) {
                return res.status(404).json(QR_CODE_NOT_FOUND_ERROR_RESPONSE)
            }
            associatedDish = await getDish(parseInt(qid, 10))
            if (!associatedDish) {
                return res.status(404).json(DISH_NOT_FOUND_ERROR_RESPONSE)
            }

            if (associatedDish.status !== DishStatus.borrowed) {
                return res.status(400).json({ error: 'operation_not_allowed', message: 'Dish not borrowed' })
            }

            ongoingTransaction = await getLatestTransactionByTstamp(parseInt(qid, 10))
            if (!ongoingTransaction) {
                return res.status(400).json({ error: 'operation_not_allowed', message: 'Transaction not found' })
            }

            await updateBorrowedStatus(associatedDish, userClaims, false, condition)

            await updateTransactionReturn(ongoingTransaction.id, {
                condition,
                timestamp: new Date().toISOString(),
                email: userClaims.email,
            })

            return res.status(200).json(DISH_RETURNED_RESPONSE)
        }

        associatedDish = await getDishById(id!)
        if (!associatedDish) {
            return res.status(404).json(DISH_NOT_FOUND_ERROR_RESPONSE)
        }

        if (associatedDish.status !== DishStatus.borrowed) {
            return res.status(400).json({ error: 'operation_not_allowed', message: 'Dish not borrowed' })
        }
        ongoingTransaction = await getLatestTransactionByTstampAndDishId(id!)
        if (!ongoingTransaction) {
            return res.status(400).json({ error: 'operation_not_allowed', message: 'Transaction not found' })
        }

        await updateBorrowedStatus(associatedDish, userClaims, false)

        await updateTransactionReturn(ongoingTransaction.id, {
            condition,
            timestamp: new Date().toISOString(),
        })

        return res.status(200).json(DISH_RETURNED_RESPONSE)
    } catch (error: any) {
        logger.error({
            reqId: req.id,
            error,
            message: 'Error when returning dish',
        })
        return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
    }
}

async function updateDishCondition(req: Request, res: Response) {
    const id = req.query['id']?.toString()
    if (!id) {
        return res.status(400).json({ error: 'bad_request', message: 'dish_id not provided' })
    }

    const validation = validateUpdateConditonRequestBody(req.body)
    if (validation.error) {
        return res.status(400).json({ error: 'bad_request', message: 'validation for condition failed' })
    }

    const condition = req.body.condition
    if (!condition) {
        return res.status(400).json({ error: 'bad_request', message: 'condition not provided' })
    }

    try {
        const associatedDish = await getDishById(id)
        if (!associatedDish) {
            return res.status(404).json(DISH_NOT_FOUND_ERROR_RESPONSE)
        }

        await updateCondition(associatedDish.id, condition)

        return res.status(200).json({ message: 'updated condition' })
    } catch (error: any) {
        logger.error({
            reqId: req.id,
            error,
            message: 'Error when updating dish condition',
        })
        return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
    }
}

async function modifyDish(req: Request, res: Response) {
    const userClaims = (req as FirebaseRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        return res.status(403).json(FORBIDDEN_ERROR_RESPONSE)
    }

    const validation = validateModifyDish(req.body)
    if (validation.error) {
        return res.status(400).json({ error: 'bad_request', message: 'validation for modify dish status failed' })
    }

    const { id, field, oldValue, newValue } = req.body

    try {
        const response = await updateDish(id, field, oldValue, newValue)
        return res.status(200).json({ response })
    } catch (error: any) {
        logger.error({
            reqId: req.id,
            error,
            message: 'Error when modifying dish',
        })
        return res.status(500).json(INTERNAL_SERVER_ERROR_RESPONSE)
    }
}

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
