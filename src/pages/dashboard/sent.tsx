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
        <div className="min-h-screen bg-aurora text-apple-text pb-20 selection:bg-purple-500/20">
            {/* Apple-style Glass Navigation */}
            <nav className="sticky top-0 z-50 glass">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 hover-lift">
                        <div className="w-9 h-9 bg-black rounded-xl text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-black/10">E</div>
                        <span className="font-semibold text-xl tracking-tight text-gray-900">EmailBlast</span>
                    </div>
                    <div className="flex items-center gap-8 text-sm font-medium text-gray-500">
                        <Link href="/dashboard" className="hover:text-primary transition-colors">Campaigns</Link>
                        <Link href="/dashboard/sent" className="text-gray-900 hover:text-primary transition-colors">History</Link>
                        <Link href="/dashboard/profile" className="hover:text-primary transition-colors">Profile</Link>
                        <Link href="/dashboard/settings" className="hover:text-primary transition-colors">Settings</Link>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shadow-inner" />
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 pt-10 animate-[fadeIn_0.5s_ease-out]">
                <Link href="/dashboard" className="text-secondary hover:text-primary transition-colors text-sm font-medium mb-8 inline-flex items-center gap-1 group">
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Campaigns
                </Link>

                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">Sent Emails</h1>
                        <p className="text-secondary text-lg">History of all AI-generated emails sent.</p>
                    </div>
                    <button
                        onClick={fetchSentEmails}
                        className="btn-secondary flex items-center gap-2"
                    >
                        ↻ Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="glass-card p-12 text-center text-secondary">Loading sent history...</div>
                ) : emails.length === 0 ? (
                    <div className="glass-card text-center py-24 flex flex-col items-center justify-center border-dashed border-2 border-gray-200/50">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-6">📨</div>
                        <h3 className="text-2xl font-bold mb-2">No emails sent yet</h3>
                        <p className="text-secondary mb-8 max-w-md">Once you generate and send campaigns, they'll appear here.</p>
                        <Link href="/dashboard" className="btn-primary">
                            Start a Campaign
                        </Link>
                    </div>
                ) : (
                    <div className="glass-card overflow-hidden p-0">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/50 backdrop-blur-sm text-gray-500 font-semibold border-b border-gray-200/60">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Recipient</th>
                                    <th className="px-6 py-4">Subject</th>
                                    <th className="px-6 py-4">Campaign</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white/50">
                                {emails.map((email) => (
                                    <tr key={email.id} className="hover:bg-blue-50/40 transition-colors group">
                                        <td className="px-6 py-4 text-secondary font-mono text-xs">
                                            {new Date(email.sent_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">{email.recipient_name}</div>
                                            <div className="text-xs text-secondary">{email.recipient_email}</div>
                                            <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">{email.company}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-900 font-medium max-w-xs truncate group-hover:text-primary transition-colors">
                                            {email.subject}
                                        </td>
                                        <td className="px-6 py-4 text-secondary">
                                            {email.campaign_name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-green-100/80 text-green-700 backdrop-blur-md shadow-sm">
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
