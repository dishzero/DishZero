import cron from 'node-cron'
import { db } from '../../firebase'
import nodeConfig from 'config'
import { getTemplate } from '../cron'
import logger from '../../logger'
import { getAllDishes } from '../dish'
import { getUserById } from '../users'
import { DishStatus } from '../../models/dish'
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'

type CronOptions = {
    cronExpression: string
    cronName?: string
}
export enum EmailClient {
    AWS = 'aws',
    Nodemailer = 'nodemailer',
}

const REGION: string = nodeConfig.get('aws.region') || 'us-west-2'

const SES_CONFIG = {
    apiVersion: '2010-12-01',
    region: REGION,
}

const sesClient = new SESClient(SES_CONFIG)

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-ses/classes/sendemailcommand.html
const sendEmail = async (recepientEmails: Array<string>, subject: string, body: string, senderEmail: string) => {
    const params = {
        Destination: {
            BccAddresses: [...recepientEmails],
        },
        Message: {
            Body: {
                Text: {
                    Charset: 'UTF-8',
                    Data: body,
                },
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject,
            },
        },
        Source: senderEmail,
    }

    const command = new SendEmailCommand(params)
    try {
        await sesClient.send(command)
    } catch (error: any) {
        logger.error({
            error,
            message: 'Failed to send emails',
        })
    }
}

let emailCron: EmailCron | null

export class EmailCron {
    private job: cron.ScheduledTask | undefined
    private readonly client: EmailClient
    private readonly options: CronOptions

    constructor(options: CronOptions, client: EmailClient) {
        this.client = client || EmailClient.AWS
        this.options = options
    }

    async start(): Promise<void> {
        let enabled = await isEmailCronEnabled()
        if (enabled) {
            this.job = cron.schedule(this.options.cronExpression, async () => {
                if (this.client === EmailClient.AWS) {
                    logger.info({ message: 'Sending email with AWS' })

                    const template = await getTemplate()
                    const subject = template.subject
                    const body = template.body
                    const senderEmail = template.senderEmail

                    // get overdue email addresses
                    const oneHour = 1000 * 3600 // hours
                    let recipients = <Array<string>>[]
                    const dishes = await getAllDishes()

                    for (const dish of dishes) {
                        if (dish.status === DishStatus.borrowed && dish.userId && dish.borrowedAt) {
                            const currentTime = new Date()
                            const borrowedDate = new Date(dish.borrowedAt.toString())
                            const hoursSinceBorrow = Math.abs(currentTime.getTime() - borrowedDate.getTime()) / oneHour

                            if (hoursSinceBorrow > 48) {
                                const user = await getUserById(dish.userId)

                                if (user?.email && !recipients.includes(user?.email)) {
                                    sendEmail([user?.email], subject, body, senderEmail)
                                    recipients.push(user?.email)
                                }
                            }
                        }
                    }

                    if (recipients.length > 0) {
                        logger.info({ message: 'Sent emails', recipients })
                    } else {
                        logger.info({ message: 'no users have overdue dish' })
                    }
                } else {
                    logger.info({ message: 'Sending email with nodemailer' })
                }
            })
        }
    }
    stop(): void {
        this.job?.stop()
    }
}

export const isEmailCronEnabled = async () => {
    const snapshot = await db.collection(nodeConfig.get('collections.cron')).doc('email').get()
    if (!snapshot.exists) {
        return false
    }

    let data = snapshot.data()
    if (!data) {
        return false
    }
    return data.enabled
}

export const initializeEmailCron = async (options: CronOptions, client: EmailClient) => {
    emailCron = new EmailCron(options, client)
    emailCron.start()
    logger.info({ message: 'starting email cron' })
}

export const getEmailCron = () => {
    return emailCron
}

export const setEmailCron = (cron: EmailCron | null) => {
    emailCron = cron
}
