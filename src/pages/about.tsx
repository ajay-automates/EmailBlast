import Link from 'next/link'

export default function AboutPage() {
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
                        <Link href="/about" className="text-gray-900 font-semibold">About</Link>
                        <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
                        <Link href="/auth/login" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold">
                            Login
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center mb-20">
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
                        Revolutionizing Email Outreach with AI
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        EmailBlast combines cutting-edge AI technology with intuitive design to help businesses
                        create personalized, high-converting email campaigns at scale.
                    </p>
                </div>

                {/* Mission */}
                <div className="bg-white rounded-2xl shadow-xl p-12 mb-16">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            We believe that every business deserves access to powerful, AI-driven email marketing tools.
                            Our mission is to democratize email outreach by making it easy, affordable, and effective for
                            companies of all sizes to connect with their audience in meaningful ways.
                        </p>
                    </div>
                </div>

                {/* Values */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Innovation</h3>
                            <p className="text-gray-600">
                                We're constantly pushing the boundaries of what's possible with AI and email marketing,
                                staying ahead of industry trends.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Customer-First</h3>
                            <p className="text-gray-600">
                                Your success is our success. We build features based on real customer feedback and needs,
                                not just what's trendy.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Trust & Privacy</h3>
                            <p className="text-gray-600">
                                We take data security seriously. Your information is encrypted, protected, and never
                                shared with third parties.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-12 mb-16">
                    <div className="grid md:grid-cols-4 gap-8 text-center text-white">
                        <div>
                            <div className="text-4xl font-black mb-2">10M+</div>
                            <div className="text-purple-100">Emails Sent</div>
                        </div>
                        <div>
                            <div className="text-4xl font-black mb-2">5,000+</div>
                            <div className="text-purple-100">Active Users</div>
                        </div>
                        <div>
                            <div className="text-4xl font-black mb-2">98%</div>
                            <div className="text-purple-100">Satisfaction Rate</div>
                        </div>
                        <div>
                            <div className="text-4xl font-black mb-2">24/7</div>
                            <div className="text-purple-100">Support</div>
                        </div>
                    </div>
                </div>

                {/* Story */}
                <div className="bg-white rounded-2xl shadow-xl p-12 mb-16">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                        <div className="space-y-4 text-gray-600 leading-relaxed">
                            <p>
                                EmailBlast was born out of frustration with existing email marketing tools. As entrepreneurs
                                ourselves, we spent countless hours manually personalizing cold emails, only to see mediocre
                                response rates.
                            </p>
                            <p>
                                We knew there had to be a better way. By combining the latest advances in AI with deep
                                expertise in email marketing, we built EmailBlast to solve this exact problem.
                            </p>
                            <p>
                                Today, thousands of businesses use EmailBlast to send millions of personalized emails every
                                month, achieving response rates 3-5x higher than traditional methods.
                            </p>
                            <p>
                                We're just getting started. Our vision is to make EmailBlast the go-to platform for
                                AI-powered email outreach, helping businesses of all sizes connect with their audience
                                in more meaningful and effective ways.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-6">Ready to transform your email outreach?</h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Join thousands of businesses using AI to supercharge their email campaigns
                    </p>
                    <Link
                        href="/auth/signup"
                        className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-xl"
                    >
                        Start Free Today →
                    </Link>
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
