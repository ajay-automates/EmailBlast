import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'

const industries = [
    'AI & Automation',
    'SaaS / Software',
    'Marketing Agency',
    'Consulting',
    'E-commerce',
    'Real Estate',
    'Restaurant / Food',
    'Healthcare',
    'Finance',
    'Recruiting',
    'Legal',
    'Education',
    'Other',
]

const companySizes = ['1-10', '11-50', '51-200', '200+']
const tones = ['professional', 'friendly', 'direct', 'casual']

export default function ProfilePage() {
    const router = useRouter()
    const user = useUser()
    const supabase = useSupabaseClient()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    const [message, setMessage] = useState('')

    const [profile, setProfile] = useState({
        companyName: '',
        websiteUrl: '',
        industry: '',
        companySize: '1-10',
        senderName: '',
        senderTitle: '',
        senderEmail: '',
        senderPhone: '',
        senderLinkedin: '',
        tagline: '',
        description: '',
        services: [''],
        uniqueValueProposition: '',
        targetAudience: '',
        keyResults: [''],
        tone: 'professional',
        callToAction: 'Would you be open to a quick 15-minute call?',
        calendarLink: '',
    })

    useEffect(() => {
        if (!user) {
            router.push('/auth/login')
            return
        }
        fetchProfile()
    }, [user])

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile')
            const data = await res.json()

            if (data.profile) {
                setProfile({
                    companyName: data.profile.company_name || '',
                    websiteUrl: data.profile.website_url || '',
                    industry: data.profile.industry || '',
                    companySize: data.profile.company_size || '1-10',
                    senderName: data.profile.sender_name || '',
                    senderTitle: data.profile.sender_title || '',
                    senderEmail: data.profile.sender_email || '',
                    senderPhone: data.profile.sender_phone || '',
                    senderLinkedin: data.profile.sender_linkedin || '',
                    tagline: data.profile.tagline || '',
                    description: data.profile.description || '',
                    services: data.profile.services || [''],
                    uniqueValueProposition: data.profile.unique_value_proposition || '',
                    targetAudience: data.profile.target_audience || '',
                    keyResults: data.profile.key_results || [''],
                    tone: data.profile.tone || 'professional',
                    callToAction: data.profile.call_to_action || 'Would you be open to a quick 15-minute call?',
                    calendarLink: data.profile.calendar_link || '',
                })
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const analyzeWebsite = async () => {
        if (!profile.websiteUrl) {
            setMessage('⚠️ Please enter your website URL first')
            return
        }

        setAnalyzing(true)
        setMessage('🔍 Analyzing your website...')

        try {
            const res = await fetch('/api/profile/analyze-website', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ websiteUrl: profile.websiteUrl }),
            })

            const data = await res.json()

            if (data.analysis) {
                setProfile(prev => ({
                    ...prev,
                    companyName: data.analysis.companyName || prev.companyName,
                    tagline: data.analysis.tagline || prev.tagline,
                    description: data.analysis.description || prev.description,
                    services: data.analysis.services?.length ? data.analysis.services : prev.services,
                    targetAudience: data.analysis.targetAudience || prev.targetAudience,
                    uniqueValueProposition: data.analysis.uniqueValueProposition || prev.uniqueValueProposition,
                    industry: data.analysis.industry || prev.industry,
                    tone: data.analysis.tone || prev.tone,
                }))
                setMessage('✅ Website analyzed! Review and edit the extracted information.')
            }
        } catch (error) {
            setMessage('❌ Failed to analyze website. Please fill in details manually.')
        } finally {
            setAnalyzing(false)
        }
    }

    const saveProfile = async () => {
        setSaving(true)
        setMessage('')

        try {
            const res = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            })

            const data = await res.json()

            if (res.ok) {
                setMessage('✅ Profile saved successfully!')
                setTimeout(() => setMessage(''), 3000)
            } else {
                setMessage('❌ Failed to save profile')
            }
        } catch (error) {
            setMessage('❌ Error saving profile')
        } finally {
            setSaving(false)
        }
    }

    const updateService = (index: number, value: string) => {
        const newServices = [...profile.services]
        newServices[index] = value
        setProfile({ ...profile, services: newServices })
    }

    const addService = () => {
        setProfile({ ...profile, services: [...profile.services, ''] })
    }

    const removeService = (index: number) => {
        const newServices = profile.services.filter((_, i) => i !== index)
        setProfile({ ...profile, services: newServices })
    }

    const updateKeyResult = (index: number, value: string) => {
        const newResults = [...profile.keyResults]
        newResults[index] = value
        setProfile({ ...profile, keyResults: newResults })
    }

    const addKeyResult = () => {
        setProfile({ ...profile, keyResults: [...profile.keyResults, ''] })
    }

    const removeKeyResult = (index: number) => {
        const newResults = profile.keyResults.filter((_, i) => i !== index)
        setProfile({ ...profile, keyResults: newResults })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
                    >
                        ← Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold mb-2">Company Profile</h1>
                    <p className="text-gray-600">
                        Fill in your business details. The AI will use this to personalize all your outreach emails.
                    </p>
                </div>

                {/* Message Banner */}
                {message && (
                    <div className={`p-4 rounded-lg mb-6 ${message.includes('✅')
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : message.includes('❌')
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                        {message}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Website Analysis Section */}
                    <section className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                            🔮 Quick Start: Analyze Your Website
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Enter your website URL and we'll automatically extract your business information using AI.
                        </p>
                        <div className="flex gap-4">
                            <input
                                type="url"
                                placeholder="https://yourwebsite.com"
                                value={profile.websiteUrl}
                                onChange={(e) => setProfile({ ...profile, websiteUrl: e.target.value })}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button
                                onClick={analyzeWebsite}
                                disabled={analyzing}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                            >
                                {analyzing ? '🔄 Analyzing...' : '✨ Analyze Website'}
                            </button>
                        </div>
                    </section>

                    {/* Basic Info */}
                    <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">📋 Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Company Name *</label>
                                <input
                                    type="text"
                                    value={profile.companyName}
                                    onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="AI Automation Consultancy"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Industry *</label>
                                <select
                                    value={profile.industry}
                                    onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select industry...</option>
                                    {industries.map(ind => (
                                        <option key={ind} value={ind}>{ind}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Company Size</label>
                                <select
                                    value={profile.companySize}
                                    onChange={(e) => setProfile({ ...profile, companySize: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    {companySizes.map(size => (
                                        <option key={size} value={size}>{size} employees</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Website URL</label>
                                <input
                                    type="url"
                                    value={profile.websiteUrl}
                                    onChange={(e) => setProfile({ ...profile, websiteUrl: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="https://yourcompany.com"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Sender Info */}
                    <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-xl font-semibold mb-2">👤 Sender Information</h2>
                        <p className="text-gray-600 mb-4 text-sm">This appears as the "From" in your emails.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Your Name *</label>
                                <input
                                    type="text"
                                    value={profile.senderName}
                                    onChange={(e) => setProfile({ ...profile, senderName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Ajay Nelavetla"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Your Title</label>
                                <input
                                    type="text"
                                    value={profile.senderTitle}
                                    onChange={(e) => setProfile({ ...profile, senderTitle: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Lead Automation Architect"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email *</label>
                                <input
                                    type="email"
                                    value={profile.senderEmail}
                                    onChange={(e) => setProfile({ ...profile, senderEmail: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="ajay@yourcompany.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={profile.senderPhone}
                                    onChange={(e) => setProfile({ ...profile, senderPhone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="+1 (857) 576-1177"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">LinkedIn Profile</label>
                                <input
                                    type="url"
                                    value={profile.senderLinkedin}
                                    onChange={(e) => setProfile({ ...profile, senderLinkedin: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="https://linkedin.com/in/yourprofile"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Business Details */}
                    <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">💼 Business Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Tagline (One-liner)</label>
                                <input
                                    type="text"
                                    value={profile.tagline}
                                    onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="We design and build AI systems for modern businesses."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={profile.description}
                                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows={3}
                                    placeholder="2-3 sentences about what you do..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Services You Offer</label>
                                {profile.services.map((service, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={service}
                                            onChange={(e) => updateService(index, e.target.value)}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="e.g., AI-Powered Email Outreach"
                                        />
                                        {profile.services.length > 1 && (
                                            <button
                                                onClick={() => removeService(index)}
                                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    onClick={addService}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    + Add another service
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Target Audience</label>
                                <input
                                    type="text"
                                    value={profile.targetAudience}
                                    onChange={(e) => setProfile({ ...profile, targetAudience: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Founders, CEOs, and operations leads at small teams (2-50 people)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">What Makes You Different?</label>
                                <textarea
                                    value={profile.uniqueValueProposition}
                                    onChange={(e) => setProfile({ ...profile, uniqueValueProposition: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows={2}
                                    placeholder="Code-first approach, not no-code tools. 100% production-ready systems."
                                />
                            </div>
                        </div>
                    </section>

                    {/* Results & Proof */}
                    <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-xl font-semibold mb-2">📊 Results & Proof</h2>
                        <p className="text-gray-600 mb-4 text-sm">Add key results to build credibility in your emails.</p>
                        <div>
                            <label className="block text-sm font-medium mb-2">Key Results</label>
                            {profile.keyResults.map((result, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={result}
                                        onChange={(e) => updateKeyResult(index, e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g., Clients save 10-15 hours per week"
                                    />
                                    {profile.keyResults.length > 1 && (
                                        <button
                                            onClick={() => removeKeyResult(index)}
                                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={addKeyResult}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                + Add another result
                            </button>
                        </div>
                    </section>

                    {/* Email Preferences */}
                    <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">✉️ Email Preferences</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Tone</label>
                                <select
                                    value={profile.tone}
                                    onChange={(e) => setProfile({ ...profile, tone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    {tones.map(tone => (
                                        <option key={tone} value={tone}>
                                            {tone.charAt(0).toUpperCase() + tone.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Calendar Link</label>
                                <input
                                    type="url"
                                    value={profile.calendarLink}
                                    onChange={(e) => setProfile({ ...profile, calendarLink: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="https://calendly.com/yourlink"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Default Call-to-Action</label>
                                <input
                                    type="text"
                                    value={profile.callToAction}
                                    onChange={(e) => setProfile({ ...profile, callToAction: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Would you be open to a quick 15-minute call?"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Save Button */}
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={saveProfile}
                            disabled={saving}
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-sm"
                        >
                            {saving ? '💾 Saving...' : '💾 Save Profile'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
