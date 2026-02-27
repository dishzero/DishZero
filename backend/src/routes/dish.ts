import express, { Request, Response } from 'express'
import { CustomRequest, verifyFirebaseToken } from '../middlewares/auth'
import { DishCondition, DishStatus } from '../models/dish'
import { Transaction } from '../models/transaction'
import {
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
} from '../services/dish'
import Logger from '../utils/logger'
import { getUserByEmail, getUserById, verifyIfUserAdmin, verifyIfUserVolunteer } from '../services/users'
import {
    registerTransaction,
    getLatestTransactionByTstamp,
    getLatestTransactionByTstampAndDishId,
} from '../services/transactions'
import { getQrCode } from '../services/qrCode'
import { db } from '../internal/firebase'
import nodeConfig from 'config'
import { User } from '../models/user'

async function getDishes(req: Request, res: Response) {
    const userClaims = (req as CustomRequest).firebase
    const id = req.query['id']?.toString()
    const qid = req.query['qid']?.toString()

    if (id) {
        try {
            const dish = await getDishById(id)
            if (!dish) {
                Logger.error({
                    message: 'Dish does not exist',
                    statusCode: 404,
                    module: 'dish.controller',
                    function: 'getDishes',
                })
                return res.status(400).json({ error: 'dish_not_found' })
            }
            Logger.info({
                message: 'retrieved dish',
                module: 'dish.controller',
                function: 'getDishes',
            })
            return res.status(200).json({ dish: dish })
        } catch (error: any) {
            Logger.error({
                message: 'Error when retrieving dish',
                error,
                statusCode: 500,
                module: 'dish.controller',
                function: 'getDishes',
            })
            return res.status(500).json({ error: 'internal_server_error', message: error.message })
        }
    } else if (qid) {
        try {
            const dish = await getDish(parseInt(qid, 10))
            if (!dish) {
                Logger.error({
                    message: 'Dish does not exist',
                    statusCode: 404,
                    module: 'dish.controller',
                    function: 'getDishes',
                })
                return res.status(400).json({ error: 'dish_not_found' })
            }
            Logger.info({
                message: 'retrieved dish',
                module: 'dish.controller',
                function: 'getDishes',
            })
            return res.status(200).json({ dish })
        } catch (error: any) {
            Logger.error({
                message: 'Error when retrieving dish',
                error,
                statusCode: 500,
                module: 'dish.controller',
                function: 'getDishes',
            })
            return res.status(500).json({ error: 'internal_server_error', message: error.message })
        }
    }

    const all = req.query['all']?.toString()
    const withEmail = req.query['withEmail']?.toString() === 'true'
    const transaction = req.query['transaction']?.toString()
    let dishes: any

    if (all === 'true') {
        if (!verifyIfUserAdmin(userClaims)) {
            Logger.error({
                module: 'dish.controller',
                message: 'User is not admin',
                statusCode: 403,
            })
            return res.status(403).json({ error: 'forbidden' })
        }

        try {
            if (transaction === 'true') {
                dishes = await getAllDishes(withEmail)
            } else {
                dishes = await getAllDishesSimple()
            }
        } catch (error: any) {
            Logger.error({
                module: 'dish.controller',
                function: 'getDishes',
                error,
                message: 'error when getting dishes from firebase',
            })

            return res.status(500).json({ error: 'internal_server_error' })
        }

        Logger.info({
            module: 'dish.controller',
            function: 'getDishes',
            message: 'sending all dishes to admin',
        })
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
        Logger.error({
            module: 'dish.controller',
            function: 'getDishes',
            error,
            message: 'error when getting user dishes from firebase',
        })

        return res.status(500).json({ error: 'internal_server_error' })
    }
}

async function getDishTypes(req: Request, res: Response) {
    const userClaims = (req as CustomRequest).firebase

    if (!verifyIfUserAdmin(userClaims)) {
        Logger.error({
            module: 'dish.controller',
            message: 'User is not admin',
            statusCode: 403,
        })
        return res.status(403).json({ error: 'forbidden' })
    }

    let dishTypes
    try {
        dishTypes = await getAllDishTypes()
    } catch (error: any) {
        Logger.error({
            module: 'dish.controller',
            function: 'getDishTypes',
            error,
            message: 'error when getting dish types from firebase',
        })

        return res.status(500).json({ error: 'internal_server_error' })
    }
    return res.status(200).json({ dishTypes })
}

async function getDishVendors(req: Request, res: Response) {
    const userClaims = (req as CustomRequest).firebase

    if (!verifyIfUserAdmin(userClaims)) {
        Logger.error({
            module: 'dish.controller',
            message: 'User is not admin',
            statusCode: 403,
        })
        return res.status(403).json({ error: 'forbidden' })
    }

    let dishVendors
    try {
        dishVendors = await getAllDishVendors()
    } catch (error: any) {
        Logger.error({
            module: 'dish.controller',
            function: 'getDishVendors',
            error,
            message: 'error when getting dish vendors from firebase',
        })

        return res.status(500).json({ error: 'internal_server_error' })
    }
    return res.status(200).json({ dishVendors })
}

async function deleteDishes(req: Request, res: Response) {
    const userClaims = (req as CustomRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        Logger.error({
            module: 'dish.controller',
            message: 'User is not admin',
            statusCode: 403,
        })
        return res.status(403).json({ error: 'forbidden' })
    }

    const dishIds = req.body.dishIds
    if (!dishIds) {
        Logger.error({
            module: 'dish.controller',
            message: 'No dishIds provided',
            statusCode: 400,
        })
        return res.status(400).json({ error: 'bad_request' })
    }

    try {
        for (const qid of dishIds) {
            const dish = await getDish(parseInt(qid, 10))
            if (!dish) {
                Logger.error({
                    module: 'dish.controller',
                    message: 'Dish not found',
                    statusCode: 400,
                })
                return res.status(400).json({ error: 'bad_request' })
            }
            if (dish.status === DishStatus.borrowed) {
                Logger.error({
                    module: 'dish.controller',
                    message: 'Dish is borrowed',
                    statusCode: 400,
                })
                return res.status(400).json({ error: 'bad_request' })
            }

            deleteDish(parseInt(qid, 10))
        }

        Logger.info({
            module: 'dish.controller',
            message: 'Successfully deleted dishes',
        })
        return res.status(200).json({ message: 'dishes deleted' })
    } catch (error: any) {
        Logger.error({
            module: 'dish.controller',
            error,
            message: 'Error when deleting dishes',
            statusCode: 500,
        })
        return res.status(500).json({ error: 'internal_server_error', message: error.message })
    }
}

async function createMultipleDishes(req: Request, res: Response) {
    const userClaims = (req as CustomRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        Logger.error({
            module: 'dish.controller',
            message: 'User is not admin',
            statusCode: 403,
        })
        return res.status(403).json({ error: 'forbidden' })
    }

    const dishType = req.body.type
    const dishIdLower = req.body.dishIdLower as number
    const dishIdUpper = req.body.dishIdUpper as number

    try {
        const response = await batchCreateDishes(dishIdLower, dishIdUpper, dishType)
        return res.status(200).json({ response })
    } catch (error: any) {
        Logger.error({
            module: 'dish.controller',
            error,
            message: 'Error when adding dishes to database',
            statusCode: 500,
        })
        return res.status(500).json({ error: 'internal_server_error', message: error.message })
    }
}

async function createDish(req: Request, res: Response) {
    const userClaims = (req as CustomRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        Logger.error({
            module: 'dish.controller',
            message: 'User is not admin',
            statusCode: 403,
        })
        return res.status(403).json({ error: 'forbidden' })
    }

    try {
        const dish = await createDishInDatabase(req.body.dish)
        return res.status(200).json({ dish })
    } catch (error: any) {
        Logger.error({
            module: 'dish.controller',
            error,
            message: 'Error when creating dish in database',
            statusCode: 500,
        })
        return res.status(500).json({ error: 'internal_server_error', message: error.message })
    }
}

async function addDishType(req: Request, res: Response) {
    const userClaims = (req as CustomRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        Logger.error({
            module: 'dish.controller',
            message: 'User is not admin',
            statusCode: 403,
        })
        return res.status(403).json({ error: 'forbidden' })
    }

    try {
        const response = await addDishTypeToDatabase(req.body.type)
        return res.status(200).json({ response })
    } catch (error: any) {
        Logger.error({
            module: 'dish.controller',
            error,
            message: 'Error when adding a new dish type to the database',
            statusCode: 500,
        })
        return res.status(500).json({ error: 'internal_server_error', message: error.message })
    }
}

async function borrowDish(req: Request, res: Response) {
    const qid = req.query['qid']?.toString()
    const email = req.query['email']?.toString()

    if (!qid) {
        Logger.error({
            module: 'dish.controller',
            message: 'No qid provided',
            statusCode: 400,
        })
        return res.status(400).json({ error: 'bad_request' })
    }

    const userClaims = (req as CustomRequest).firebase

    try {
        const qrCodeExits = await getQrCode(qid)
        if (!qrCodeExits) {
            Logger.error({
                module: 'dish.controller',
                message: 'qr code not found',
            })
            return res.status(400).json({ error: 'operation_not_allowed', message: 'qr code not found' })
        }

        const associatedDish = await getDish(parseInt(qid, 10))
        if (!associatedDish) {
            Logger.error({
                module: 'dish.controller',
                message: 'Dish not found',
            })
            return res.status(400).json({ error: 'operation_not_allowed', message: 'Dish not found' })
        }

        if (associatedDish.status === DishStatus.borrowed) {
            Logger.error({
                module: 'dish.controller',
                message: 'Dish already borrowed',
            })
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

        Logger.info({
            module: 'dish.controller',
            message: 'Successfully borrowed dish',
        })
        return res.status(200).json({ transaction: newTransaction })
    } catch (error: any) {
        Logger.error({
            module: 'dish.controller',
            function: 'borrowDish',
            error,
            message: 'Error when borrowing dish',
            statusCode: 500,
        })
        return res.status(500).json({ error: 'internal_server_error', message: error.message })
    }
}

async function returnDish(req: Request, res: Response) {
    const qid = req.query['qid']?.toString()
    const id = req.query['id']?.toString()
    if (!qid && !id) {
        Logger.error({
            module: 'dish.controller',
            message: 'No qid provided',
            statusCode: 400,
        })
        return res.status(400).json({ error: 'bad_request', message: 'no dish_id provided' })
    }

    const validation = validateReturnDishRequestBody(req.body.returned)
    if (validation.error) {
        Logger.error({
            module: 'dish.controller',
            message: 'No values for condition provided',
            statusCode: 400,
        })

        return res.status(400).json({ error: 'bad_request', message: 'no values for condition provided' })
    }
    const { condition } = req.body.returned

    const userClaims = (req as CustomRequest).firebase
    if (!verifyIfUserAdmin(userClaims) && !verifyIfUserVolunteer(userClaims)) {
        Logger.error({
            module: 'dish.controller',
            message: 'User is not admin',
            statusCode: 403,
        })
        return res.status(403).json({ error: 'forbidden' })
    }
    try {
        let qrCodeExits
        let associatedDish
        let ongoingTransaction

        if (qid) {
            qrCodeExits = await getQrCode(qid)
            if (!qrCodeExits) {
                Logger.error({
                    module: 'dish.controller',
                    message: 'qr code not found',
                })
                return res.status(400).json({ error: 'operation_not_allowed', message: 'qr code not found' })
            }
            associatedDish = await getDish(parseInt(qid, 10))
            if (!associatedDish) {
                Logger.error({
                    module: 'dish.controller',
                    message: 'Dish not found',
                })
                return res.status(400).json({ error: 'operation_not_allowed', message: 'Dish not found' })
            }

            if (associatedDish.status !== DishStatus.borrowed) {
                Logger.error({
                    module: 'dish.controller',
                    message: 'Dish not borrowed',
                    function: 'returnDish',
                })
                return res.status(400).json({ error: 'operation_not_allowed', message: 'Dish not borrowed' })
            }

            ongoingTransaction = await getLatestTransactionByTstamp(parseInt(qid, 10))
            if (!ongoingTransaction) {
                Logger.error({
                    module: 'dish.controller',
                    message: 'Transaction not found',
                    function: 'returnDish',
                })
                return res.status(400).json({ error: 'operation_not_allowed', message: 'Transaction not found' })
            }

            await updateBorrowedStatus(associatedDish, userClaims, false, condition)

            await db
                .collection(nodeConfig.get('collections.transactions'))
                .doc(ongoingTransaction.id)
                .update({
                    returned: {
                        condition,
                        timestamp: new Date().toISOString(),
                        email: userClaims.email,
                    },
                })

            Logger.info({
                module: 'dish.controller',
                message: 'Successfully returned dish',
                function: 'returnDish',
            })

            return res.status(200).json({ message: 'dish returned' })
        }

        associatedDish = await getDishById(id!)
        if (!associatedDish) {
            Logger.error({
                module: 'dish.controller',
                message: 'Dish not found',
            })
            return res.status(400).json({ error: 'operation_not_allowed', message: 'Dish not found' })
        }

        if (associatedDish.status !== DishStatus.borrowed) {
            Logger.error({
                module: 'dish.controller',
                message: 'Dish not borrowed',
                function: 'returnDish',
            })
            return res.status(400).json({ error: 'operation_not_allowed', message: 'Dish not borrowed' })
        }
        ongoingTransaction = await getLatestTransactionByTstampAndDishId(id!)
        if (!ongoingTransaction) {
            Logger.error({
                module: 'dish.controller',
                message: 'Transaction not found',
                function: 'returnDish',
            })
            return res.status(400).json({ error: 'operation_not_allowed', message: 'Transaction not found' })
        }

        await updateBorrowedStatus(associatedDish, userClaims, false)

        await db
            .collection(nodeConfig.get('collections.transactions'))
            .doc(ongoingTransaction.id)
            .update({
                returned: {
                    condition,
                    timestamp: new Date().toISOString(),
                },
            })

        Logger.info({
            module: 'dish.controller',
            message: 'Successfully returned dish',
            function: 'returnDish',
        })

        return res.status(200).json({ message: 'dish returned' })
    } catch (error: any) {
        Logger.error({
            module: 'dish.controller',
            function: 'returnDish',
            error,
            message: 'Error when returning dish',
        })
        return res.status(500).json({ error: 'internal_server_error', message: error.message })
    }
}

async function updateDishCondition(req: Request, res: Response) {
    const id = req.query['id']?.toString()
    if (!id) {
        Logger.error({
            module: 'dish.controller',
            message: 'No qid provided',
            statusCode: 400,
        })
        return res.status(400).json({ error: 'bad_request', message: 'dish_id not provided' })
    }

    const validation = validateUpdateConditonRequestBody(req.body)
    if (validation.error) {
        Logger.error({
            module: 'dish.controller',
            error: validation.error,
            message: 'No values for condition provided',
            statusCode: 400,
        })

        return res.status(400).json({ error: 'bad_request', message: 'validation for condition failed' })
    }

    const condition = req.body.condition
    if (!condition) {
        Logger.error({
            module: 'dish.controller',
            message: 'No condition provided',
            statusCode: 400,
        })
        return res.status(400).json({ error: 'bad_request', message: 'condition not provided' })
    }

    try {
        const associatedDish = await getDishById(id)
        if (!associatedDish) {
            Logger.error({
                module: 'dish.controller',
                message: 'Dish not found',
            })
            return res.status(400).json({ error: 'operation_not_allowed', message: 'Dish not found' })
        }

        await updateCondition(associatedDish.id, condition)

        Logger.info({
            module: 'dish.controller',
            function: 'updateDishCondition',
            message: 'successfully updated dish condition',
        })

        return res.status(200).json({ message: 'updated condition' })
    } catch (error: any) {
        Logger.error({
            module: 'dish.controller',
            function: 'updateDishCondition',
            error,
            message: 'Error when updating dish condition',
        })

        return res.status(200).json({ message: 'dish condition updated' })
    }
}

async function modifyDish(req: Request, res: Response) {
    const userClaims = (req as CustomRequest).firebase
    if (!verifyIfUserAdmin(userClaims)) {
        Logger.error({
            module: 'dish.controller',
            message: 'User is not admin',
            statusCode: 403,
        })
        return res.status(403).json({ error: 'forbidden' })
    }

    const validation = validateModifyDish(req.body)
    if (validation.error) {
        Logger.error({
            module: 'dish.controller',
            error: validation.error,
            message: 'Validation for modify dish failed',
            statusCode: 400,
        })

        return res.status(400).json({ error: 'bad_request', message: 'validation for modify dish status failed' })
    }

    const { id, field, oldValue, newValue } = req.body

    try {
        const response = await updateDish(id, field, oldValue, newValue)
        return res.status(200).json({ response })
    } catch (error: any) {
        Logger.error({
            module: 'dish.controller',
            error,
            message: 'Error when modifying dish',
            statusCode: 500,
        })
        return res
            .status(500)
            .json({ error: 'internal_server_error', message: error.message ?? 'Unexpected error occurred' })
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
