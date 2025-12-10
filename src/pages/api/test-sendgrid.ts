import { NextApiRequest, NextApiResponse } from 'next'
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        // Check if API key is set
        if (!process.env.SENDGRID_API_KEY) {
            return res.status(500).json({
                error: 'SENDGRID_API_KEY not configured',
                configured: false
            })
        }

        if (!process.env.SENDGRID_FROM_EMAIL) {
            return res.status(500).json({
                error: 'SENDGRID_FROM_EMAIL not configured',
                configured: false
            })
        }

        // Try to send a test email
        const msg = {
            to: process.env.SENDGRID_FROM_EMAIL, // Send to yourself for testing
            from: process.env.SENDGRID_FROM_EMAIL,
            subject: 'EmailBlast - SendGrid Test',
            text: 'This is a test email from EmailBlast to verify SendGrid is working correctly.',
            html: '<p>This is a test email from EmailBlast to verify SendGrid is working correctly.</p>',
        }

        const [response] = await sgMail.send(msg)

        res.json({
            success: true,
            message: 'Test email sent successfully!',
            messageId: response.headers['x-message-id'],
            from: process.env.SENDGRID_FROM_EMAIL,
            apiKeyConfigured: true,
        })
    } catch (error: any) {
        console.error('SendGrid test error:', error.response?.body || error)

        const errorDetails = error.response?.body?.errors?.[0] || {}

        res.status(500).json({
            success: false,
            error: errorDetails.message || error.message || 'Unknown error',
            details: error.response?.body || error.message,
            from: process.env.SENDGRID_FROM_EMAIL,
            apiKeyConfigured: !!process.env.SENDGRID_API_KEY,
        })
    }
}
