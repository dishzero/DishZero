import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp, FieldValue, Filter } from 'firebase-admin/firestore'
import * as admin from 'firebase-admin'
import { Request } from 'express'
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier'
const serviceAccount = require('../../credentials.json')

initializeApp({
    credential: cert(serviceAccount),
})

const db = getFirestore()
const auth = admin.auth()

interface FirebaseRequest extends Request {
    firebase: DecodedIdToken
}

export { db, Timestamp, FieldValue, Filter, auth, FirebaseRequest }
