import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface EmailPreview {
    id: string;
    contact: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        company: string;
        position: string;
        enrichment_data: any;
    };
    variation: {
        id: string;
        subject: string;
        body: string;
    };
}

export default function ReviewEmails() {
    const router = useRouter();
    const { id } = router.query;
    const [emails, setEmails] = useState<EmailPreview[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sending, setSending] = useState<string | null>(null);

    // Editing state
    const [editing, setEditing] = useState(false);
    const [editSubject, setEditSubject] = useState('');
    const [editBody, setEditBody] = useState('');
    const [saving, setSaving] = useState(false);

    // Sync editing state when email changes
    useEffect(() => {
        if (emails[currentIndex]) {
            setEditSubject(emails[currentIndex].variation.subject);
            setEditBody(emails[currentIndex].variation.body);
        }
    }, [currentIndex, emails]);

    useEffect(() => {
        if (id) {
            fetchEmailsForReview();
        }
    }, [id]);

    const fetchEmailsForReview = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/campaigns/${id}/review`);
            if (res.ok) {
                const data = await res.json();
                setEmails(data);
            }
        } catch (error) {
            console.error('Error fetching emails:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendNow = async (variationId: string, contactId: string) => {
        if (!confirm('Send this email immediately?')) return;

        setSending(variationId);
        try {
            const res = await fetch(`/api/campaigns/${id}/send-one`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ variationId, contactId })
            });

            if (res.ok) {
                alert('Email sent successfully!');
                // Move to next email
                if (currentIndex < emails.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                }
            } else {
                alert('Failed to send email');
            }
        } catch (error) {
            alert('Error sending email');
        } finally {
            setSending(null);
        }
    };

    const handleSchedule = async (variationId: string, contactId: string) => {
        const time = prompt('Schedule for when? (e.g., "2 hours", "tomorrow 9am")');
        if (!time) return;

        try {
            const res = await fetch(`/api/campaigns/${id}/schedule-one`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ variationId, contactId, scheduleTime: time })
            });

            if (res.ok) {
                alert('Email scheduled!');
                if (currentIndex < emails.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                }
            }
        } catch (error) {
            alert('Error scheduling email');
        }
    };

    const handleRewrite = async (variationId: string, contactId: string) => {
        if (!confirm('Regenerate this email with AI?')) return;

        try {
            const res = await fetch(`/api/campaigns/${id}/rewrite-one`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ variationId, contactId })
            });

            if (res.ok) {
                const newEmail = await res.json();
                // Update the current email in state
                const updated = [...emails];
                updated[currentIndex].variation = newEmail;
                setEmails(updated);
                alert('Email rewritten!');
            }
        } catch (error) {
            alert('Error rewriting email');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-gray-600">Loading emails...</div>
            </div>
        );
    }

    if (emails.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">No emails to review</h2>
                    <Link href={`/dashboard/${id}`} className="text-blue-600 hover:underline">
                        Go back to campaign
                    </Link>
                </div>
            </div>
        );
    }

    const current = emails[currentIndex];



    const handleSave = async () => {
        setSaving(true);
        const currentVariationId = emails[currentIndex].variation.id;

        try {
            const res = await fetch(`/api/campaigns/${id}/update-one`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    variationId: currentVariationId,
                    subject: editSubject,
                    body: editBody
                })
            });

            if (res.ok) {
                // Update local state
                const updated = [...emails];
                updated[currentIndex].variation.subject = editSubject;
                updated[currentIndex].variation.body = editBody;
                setEmails(updated);
                // Visual feedback checkmark could go here
            } else {
                alert('Failed to save changes');
            }
        } catch (error) {
            alert('Error saving changes');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/dashboard/${id}`} className="text-gray-600 hover:text-gray-900">
                            ← Back
                        </Link>
                        <h1 className="text-lg font-bold">Review Emails</h1>
                    </div>
                    <div className="text-sm text-gray-600">
                        Email {currentIndex + 1} of {emails.length}
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>{Math.round(((currentIndex + 1) / emails.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentIndex + 1) / emails.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Email Preview Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Recipient Info */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">
                                    {current.contact.first_name} {current.contact.last_name}
                                </h2>
                                <p className="text-blue-100 mb-2">{current.contact.position}</p>
                                <p className="text-sm text-blue-200">{current.contact.company}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-blue-200">Sending to:</p>
                                <p className="font-mono text-sm">{current.contact.email}</p>
                            </div>
                        </div>

                        {/* Company Research Preview */}
                        {current.contact.enrichment_data && (
                            <div className="mt-4 pt-4 border-t border-blue-500/30">
                                <p className="text-xs text-blue-200 mb-1">AI Research:</p>
                                <p className="text-sm text-blue-100">
                                    🌐 {current.contact.enrichment_data.companyWebsite}
                                </p>
                                <p className="text-sm text-blue-100 mt-1">
                                    💡 {current.contact.enrichment_data.companyServices}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Email Content - NOW EDITABLE */}
                    <div className="p-8">
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Subject Line
                                </label>
                                {saving && <span className="text-xs text-green-600 font-bold animate-pulse">Saving...</span>}
                            </div>
                            <input
                                className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-gray-900 transition-all"
                                value={editSubject}
                                onChange={(e) => setEditSubject(e.target.value)}
                                onBlur={handleSave} // Auto-save on blur
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Email Body
                                </label>
                            </div>
                            <textarea
                                className="w-full h-96 bg-gray-50 rounded-lg p-6 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-sans text-gray-800 leading-relaxed resize-none transition-all"
                                value={editBody}
                                onChange={(e) => setEditBody(e.target.value)}
                                onBlur={handleSave} // Auto-save on blur
                            />
                            <p className="text-xs text-gray-400 mt-2 text-right">Changes auto-save when you click away</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleSendNow(current.variation.id, current.contact.id)}
                                disabled={sending === current.variation.id}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {sending === current.variation.id ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        ✉️ Send Now
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => handleSchedule(current.variation.id, current.contact.id)}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                📅 Schedule
                            </button>

                            <button
                                onClick={() => handleRewrite(current.variation.id, current.contact.id)}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                ✨ Rewrite with AI
                            </button>
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between mt-4">
                            <button
                                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                                disabled={currentIndex === 0}
                                className="text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed font-medium"
                            >
                                ← Previous
                            </button>
                            <button
                                onClick={() => setCurrentIndex(Math.min(emails.length - 1, currentIndex + 1))}
                                disabled={currentIndex === emails.length - 1}
                                className="text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed font-medium"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Navigation */}
                <div className="mt-6 flex gap-2 flex-wrap justify-center">
                    {emails.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-10 h-10 rounded-full font-bold transition-all ${idx === currentIndex
                                ? 'bg-blue-600 text-white scale-110'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
            </div >
        </div >
    );
}
