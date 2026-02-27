import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import nodeConfig from 'config'
import logger from '../utils/logger'

const REGION: string = nodeConfig.get('aws.region') || 'us-west-2'

const SES_CONFIG = {
    apiVersion: '2010-12-01',
    region: REGION
}

const sesClient = new SESClient(SES_CONFIG)

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-ses/classes/sendemailcommand.html
export const sendEmail = async (recepientEmails: Array<string>, subject: string, body: string, senderEmail: string) => {
    const params = {
        Destination: {
            BccAddresses: [...recepientEmails]
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

export { sesClient }
