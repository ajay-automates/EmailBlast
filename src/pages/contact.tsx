import Link from 'next/link'
import { useState } from 'react'

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    })
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('sending')

        // Simulate sending (replace with actual API call)
        setTimeout(() => {
            setStatus('success')
            setFormData({ name: '', email: '', subject: '', message: '' })
            setTimeout(() => setStatus('idle'), 3000)
        }, 1000)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                            E
                        </div>
                        <span className="text-xl font-bold">EmailBlast</span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
                        <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
                        <Link href="/contact" className="text-gray-900 font-semibold">Contact</Link>
                        <Link href="/auth/login" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold">
                            Login
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-black text-gray-900 mb-4">Get in Touch</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                    {/* Contact Form */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold mb-6">Send us a message</h2>

                        {status === 'success' && (
                            <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg">
                                ✅ Message sent successfully! We'll get back to you soon.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="Your name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="you@company.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Subject *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="How can we help?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Message *</label>
                                <textarea
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    rows={6}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                                    placeholder="Tell us more about your inquiry..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all shadow-lg"
                            >
                                {status === 'sending' ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <h3 className="text-xl font-bold mb-6">Contact Information</h3>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Email</h4>
                                        <a href="mailto:support@emailblast.com" className="text-purple-600 hover:text-purple-800">
                                            support@emailblast.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Response Time</h4>
                                        <p className="text-gray-600">We typically respond within 24 hours</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Live Chat</h4>
                                        <p className="text-gray-600">Available for Pro & Business plans</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
                            <h3 className="text-xl font-bold mb-4">Need immediate help?</h3>
                            <p className="mb-6 text-purple-100">
                                Check out our comprehensive FAQ section for quick answers to common questions.
                            </p>
                            <Link
                                href="/faq"
                                className="inline-block px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-all"
                            >
                                Visit FAQ →
                            </Link>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <h3 className="text-xl font-bold mb-4">Sales Inquiries</h3>
                            <p className="text-gray-600 mb-4">
                                Interested in our Business plan or need a custom solution? Our sales team is here to help.
                            </p>
                            <a
                                href="mailto:sales@emailblast.com"
                                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
                            >
                                Contact Sales
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12 mt-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h4 className="text-white font-bold mb-4">EmailBlast</h4>
                            <p className="text-sm">AI-powered email outreach for modern businesses.</p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/pricing">Pricing</Link></li>
                                <li><Link href="/faq">FAQ</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/about">About</Link></li>
                                <li><Link href="/contact">Contact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/privacy">Privacy Policy</Link></li>
                                <li><Link href="/terms">Terms of Service</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-sm">
                        <p>&copy; 2024 EmailBlast. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
