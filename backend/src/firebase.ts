import { Request } from 'express';
import * as admin from 'firebase-admin';
import { cert, initializeApp } from 'firebase-admin/app';
import { FieldValue, Filter, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

const serviceAccount = require('../credentials.json');

initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore();
const auth = admin.auth();

interface FirebaseRequest extends Request {
    firebase: DecodedIdToken;
}

export { db, Timestamp, FieldValue, Filter, auth, FirebaseRequest };
