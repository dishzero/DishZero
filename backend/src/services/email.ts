import nodeConfig from 'config'
import { db } from '../firebase'

export const getTemplate = async () => {
    let snapshot = await db.collection(nodeConfig.get('collections.cron')).doc('email').get()

    const data = snapshot.data()
    return {
        subject: data?.subject,
        body: data?.body,
        senderEmail: data?.senderEmail,
    }
}

export const fetchEmailCron = async () => {
    const snapshot = await db.collection(nodeConfig.get('collections.cron')).doc('email').get()
    if (!snapshot.exists) {
        throw new Error('Cron does not exist')
    }
    return snapshot.data()
}

export const updateEmailConfig = async (update: Record<string, unknown>) => {
    await db.collection(nodeConfig.get('collections.cron')).doc('email').update(update)
}

export const setEmailTemplate = async (template: { subject: string; body: string; senderEmail?: string }) => {
    const { subject, body, senderEmail } = template
    await db.collection(nodeConfig.get('collections.cron')).doc('email').update({
        senderEmail,
        subject,
        body,
    })
}

export const setEmailCronExpression = async (expression: string) => {
    await db.collection(nodeConfig.get('collections.cron')).doc('email').update({
        expression,
    })
}

export const setEmailCronEnabled = async (enabled: boolean) => {
    await db.collection(nodeConfig.get('collections.cron')).doc('email').update({
        enabled,
    })
}
