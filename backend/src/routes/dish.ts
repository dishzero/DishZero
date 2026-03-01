import express, { Request, Response } from 'express';

import { BAD_REQUEST_ERROR_RESPONSE, FORBIDDEN_ERROR_RESPONSE, QR_CODE_NOT_FOUND_ERROR_RESPONSE } from '@/constants';
import { FirebaseRequest } from '@/firebase';
import { asyncRouteHandler, verifyAuthorizedRoles, verifyFirebaseToken } from '@/middlewares';
import {
    addDishTypeToDatabase,
    batchCreateDishes,
    createDishInDatabase,
    deleteDish,
    DishCondition,
    DishStatus,
    getAllDishes,
    getAllDishesSimple,
    getAllDishTypes,
    getAllDishVendors,
    getDish,
    getDishById,
    getUserDishes,
    getUserDishesSimple,
    updateBorrowedStatus,
    updateCondition,
    updateDish,
    validateModifyDish,
    validateReturnDishRequestBody,
    validateUpdateConditonRequestBody,
} from '@/services/dish';
import { getQrCode } from '@/services/qrCode';
import {
    getLatestTransactionByTstamp,
    getLatestTransactionByTstampAndDishId,
    registerTransaction,
    Transaction,
    updateTransactionReturn,
} from '@/services/transactions';
import { getUserByEmail, getUserById, User } from '@/services/users';

const DISH_NOT_FOUND_ERROR_RESPONSE = { error: 'dish_not_found' };
const DISH_RETURNED_RESPONSE = { message: 'dish returned' };

async function getDishes(req: Request, res: Response) {
    const userClaims = (req as FirebaseRequest).firebase;
    const id = req.query['id']?.toString();
    const qid = req.query['qid']?.toString();

    if (id) {
        const dish = await getDishById(id);
        if (!dish) {
            return res.status(404).json(DISH_NOT_FOUND_ERROR_RESPONSE);
        }
        return res.status(200).json({ dish: dish });
    } else if (qid) {
        const dish = await getDish(parseInt(qid, 10));
        if (!dish) {
            return res.status(404).json(DISH_NOT_FOUND_ERROR_RESPONSE);
        }
        return res.status(200).json({ dish });
    }

    const all = req.query['all']?.toString();
    const withEmail = req.query['withEmail']?.toString() === 'true';
    const transaction = req.query['transaction']?.toString();
    let dishes: any;

    if (all === 'true') {
        // TODO: we should split out the "all" case to a different route for seperation of concerns and so we can use the verifyAuthorizedRoles(['admin']) middleware here
        if (userClaims.role !== 'admin') {
            return res.status(403).json(FORBIDDEN_ERROR_RESPONSE);
        }

        if (transaction === 'true') {
            dishes = await getAllDishes(withEmail);
        } else {
            dishes = await getAllDishesSimple();
        }

        return res.status(200).json({ dishes });
    }

    if (transaction === 'true') {
        dishes = await getUserDishes(userClaims);
    } else {
        dishes = await getUserDishesSimple(userClaims);
    }

    return res.status(200).json({ dishes });
}

async function getDishTypes(req: Request, res: Response) {
    const dishTypes = await getAllDishTypes();
    return res.status(200).json({ dishTypes });
}

async function getDishVendors(req: Request, res: Response) {
    const dishVendors = await getAllDishVendors();
    return res.status(200).json({ dishVendors });
}

async function deleteDishes(req: Request, res: Response) {
    const dishIds = req.body.dishIds;
    if (!dishIds) {
        return res.status(400).json(BAD_REQUEST_ERROR_RESPONSE);
    }

    for (const qid of dishIds) {
        const dish = await getDish(parseInt(qid, 10));
        if (!dish) {
            return res.status(400).json(BAD_REQUEST_ERROR_RESPONSE);
        }
        if (dish.status === DishStatus.borrowed) {
            return res.status(400).json(BAD_REQUEST_ERROR_RESPONSE);
        }

        await deleteDish(parseInt(qid, 10));
    }

    return res.status(200).json({ message: 'dishes deleted' });
}

async function createMultipleDishes(req: Request, res: Response) {
    const dishType = req.body.type;
    const dishIdLower = req.body.dishIdLower as number;
    const dishIdUpper = req.body.dishIdUpper as number;

    const response = await batchCreateDishes(dishIdLower, dishIdUpper, dishType, req.id.toString());
    return res.status(200).json({ response });
}

async function createDish(req: Request, res: Response) {
    const dish = await createDishInDatabase(req.body.dish, req.id.toString());
    return res.status(200).json({ dish });
}

async function addDishType(req: Request, res: Response) {
    const response = await addDishTypeToDatabase(req.body.type);
    return res.status(200).json({ response });
}

async function borrowDish(req: Request, res: Response) {
    const qid = req.query['qid']?.toString();
    const email = req.query['email']?.toString();

    if (!qid) {
        return res.status(400).json(BAD_REQUEST_ERROR_RESPONSE);
    }

    const userClaims = (req as FirebaseRequest).firebase;

    const qrCodeExits = await getQrCode(qid);
    if (!qrCodeExits) {
        return res.status(404).json(QR_CODE_NOT_FOUND_ERROR_RESPONSE);
    }

    const associatedDish = await getDish(parseInt(qid, 10));
    if (!associatedDish) {
        return res.status(404).json(DISH_NOT_FOUND_ERROR_RESPONSE);
    }

    if (associatedDish.status === DishStatus.borrowed) {
        return res.status(400).json({ error: 'operation_not_allowed', message: 'Dish already borrowed' });
    }
    const user = email ? ((await getUserByEmail(email!)) as User) : ((await getUserById(userClaims.uid)) as User);
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
    };

    const newTransaction = await registerTransaction(transaction);
    await updateBorrowedStatus(associatedDish, userClaims, true);

    return res.status(200).json({ transaction: newTransaction });
}

async function returnDish(req: Request, res: Response) {
    const qid = req.query['qid']?.toString();
    const id = req.query['id']?.toString();
    if (!qid && !id) {
        return res.status(400).json({ error: 'bad_request', message: 'no dish_id provided' });
    }

    const validation = validateReturnDishRequestBody(req.body.returned);
    if (validation.error) {
        return res.status(400).json({ error: 'bad_request', message: 'no values for condition provided' });
    }
    const { condition } = req.body.returned;
    const userClaims = (req as FirebaseRequest).firebase;

    let qrCodeExits;
    let associatedDish;
    let ongoingTransaction;

    if (qid) {
        qrCodeExits = await getQrCode(qid);
        if (!qrCodeExits) {
            return res.status(404).json(QR_CODE_NOT_FOUND_ERROR_RESPONSE);
        }
        associatedDish = await getDish(parseInt(qid, 10));
        if (!associatedDish) {
            return res.status(404).json(DISH_NOT_FOUND_ERROR_RESPONSE);
        }

        if (associatedDish.status !== DishStatus.borrowed) {
            return res.status(400).json({ error: 'operation_not_allowed', message: 'Dish not borrowed' });
        }

        ongoingTransaction = await getLatestTransactionByTstamp(parseInt(qid, 10));
        if (!ongoingTransaction) {
            return res.status(400).json({ error: 'operation_not_allowed', message: 'Transaction not found' });
        }

        await updateBorrowedStatus(associatedDish, userClaims, false, condition);

        await updateTransactionReturn(ongoingTransaction.id, {
            condition,
            timestamp: new Date().toISOString(),
            email: userClaims.email,
        });

        return res.status(200).json(DISH_RETURNED_RESPONSE);
    }

    associatedDish = await getDishById(id!);
    if (!associatedDish) {
        return res.status(404).json(DISH_NOT_FOUND_ERROR_RESPONSE);
    }

    if (associatedDish.status !== DishStatus.borrowed) {
        return res.status(400).json({ error: 'operation_not_allowed', message: 'Dish not borrowed' });
    }
    ongoingTransaction = await getLatestTransactionByTstampAndDishId(id!);
    if (!ongoingTransaction) {
        return res.status(400).json({ error: 'operation_not_allowed', message: 'Transaction not found' });
    }

    await updateBorrowedStatus(associatedDish, userClaims, false);

    await updateTransactionReturn(ongoingTransaction.id, {
        condition,
        timestamp: new Date().toISOString(),
    });

    return res.status(200).json(DISH_RETURNED_RESPONSE);
}

async function updateDishCondition(req: Request, res: Response) {
    const id = req.query['id']?.toString();
    if (!id) {
        return res.status(400).json({ error: 'bad_request', message: 'dish_id not provided' });
    }

    const validation = validateUpdateConditonRequestBody(req.body);
    if (validation.error) {
        return res.status(400).json({ error: 'bad_request', message: 'validation for condition failed' });
    }

    const condition = req.body.condition;
    if (!condition) {
        return res.status(400).json({ error: 'bad_request', message: 'condition not provided' });
    }

    const associatedDish = await getDishById(id);
    if (!associatedDish) {
        return res.status(404).json(DISH_NOT_FOUND_ERROR_RESPONSE);
    }

    await updateCondition(associatedDish.id, condition);

    return res.status(200).json({ message: 'updated condition' });
}

async function modifyDish(req: Request, res: Response) {
    const validation = validateModifyDish(req.body);
    if (validation.error) {
        return res.status(400).json({ error: 'bad_request', message: 'validation for modify dish status failed' });
    }

    const { id, field, oldValue, newValue } = req.body;

    const response = await updateDish(id, field, oldValue, newValue);
    return res.status(200).json({ response });
}

const router = express.Router();

router.get('/', verifyFirebaseToken, asyncRouteHandler(getDishes));
router.get('/getDishTypes', verifyFirebaseToken, verifyAuthorizedRoles(['admin']), asyncRouteHandler(getDishTypes));
router.get('/getDishVendors', verifyFirebaseToken, verifyAuthorizedRoles(['admin']), asyncRouteHandler(getDishVendors));
router.post(
    '/createMultipleDishes',
    verifyFirebaseToken,
    verifyAuthorizedRoles(['admin']),
    asyncRouteHandler(createMultipleDishes),
);
router.post('/addDishType', verifyFirebaseToken, verifyAuthorizedRoles(['admin']), asyncRouteHandler(addDishType));
router.post('/modifyDish', verifyFirebaseToken, verifyAuthorizedRoles(['admin']), asyncRouteHandler(modifyDish));
router.post('/create', verifyFirebaseToken, verifyAuthorizedRoles(['admin']), asyncRouteHandler(createDish));
router.post('/borrow', verifyFirebaseToken, asyncRouteHandler(borrowDish));
router.post(
    '/return',
    verifyFirebaseToken,
    verifyAuthorizedRoles(['admin', 'volunteer']),
    asyncRouteHandler(returnDish),
);
router.post('/delete', verifyFirebaseToken, verifyAuthorizedRoles(['admin']), asyncRouteHandler(deleteDishes));
router.post('/condition', verifyFirebaseToken, asyncRouteHandler(updateDishCondition));

export { router as dishRouter };
