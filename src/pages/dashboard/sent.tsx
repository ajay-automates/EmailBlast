import { useState, useEffect } from 'react'
import Link from 'next/link'

interface SentEmail {
    id: string
    sent_at: string
    status: string
    recipient_email: string
    recipient_name: string
    company: string
    campaign_name: string
    subject: string
}

export default function SentEmails() {
    const [emails, setEmails] = useState<SentEmail[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSentEmails()
    }, [])

    const fetchSentEmails = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('auth_token')
            const res = await fetch('/api/emails/sent', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            if (res.ok) {
                const data = await res.json()
                setEmails(data)
            }
        } catch (error) {
            console.error('Error fetching sent emails:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Sent Emails History</h1>
                    </div>
                    <button
                        onClick={fetchSentEmails}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        ↻ Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading sent history...</div>
                ) : emails.length === 0 ? (
                    <div className="card text-center py-12">
                        <p className="text-gray-600 mb-2">No emails sent yet.</p>
                        <Link href="/dashboard" className="text-blue-600 font-medium">
                            Go start a campaign!
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {emails.map((email) => (
                                    <tr key={email.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(email.sent_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{email.recipient_name}</div>
                                            <div className="text-sm text-gray-500">{email.recipient_email}</div>
                                            <div className="text-xs text-gray-400">{email.company}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                            {email.subject}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {email.campaign_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {email.status || 'Sent'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
