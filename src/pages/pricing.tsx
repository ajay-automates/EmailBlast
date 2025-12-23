import Link from 'next/link'
import { useState } from 'react'

const plans = [
    {
        name: 'Free',
        price: '$0',
        period: 'forever',
        description: 'Perfect for trying out EmailBlast',
        features: [
            '50 emails per month',
            '1 campaign',
            'AI email generation',
            'Basic analytics',
            'Email support',
        ],
        cta: 'Get Started Free',
        href: '/auth/signup',
        popular: false,
    },
    {
        name: 'Pro',
        price: '$29',
        period: 'per month',
        description: 'For professionals and small teams',
        features: [
            '5,000 emails per month',
            'Unlimited campaigns',
            'AI email generation',
            'Advanced analytics',
            'A/B testing',
            'Priority support',
            'Custom templates',
            'Reply detection',
        ],
        cta: 'Start Pro Trial',
        href: '/auth/signup?plan=pro',
        popular: true,
    },
    {
        name: 'Business',
        price: '$99',
        period: 'per month',
        description: 'For growing businesses',
        features: [
            '25,000 emails per month',
            'Unlimited campaigns',
            'AI email generation',
            'Advanced analytics',
            'A/B testing',
            'Priority support',
            'Custom templates',
            'Reply detection',
            'Team collaboration',
            'API access',
            'Dedicated account manager',
        ],
        cta: 'Contact Sales',
        href: '/contact',
        popular: false,
    },
]

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                            E
                        </div>
                        <span className="text-xl font-bold">EmailBlast</span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
                        <Link href="/pricing" className="text-gray-900 font-semibold">Pricing</Link>
                        <Link href="/faq" className="text-gray-600 hover:text-gray-900">FAQ</Link>
                        <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">Login</Link>
                        <Link href="/auth/signup" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
                <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
                    Simple, Transparent Pricing
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
                    Choose the perfect plan for your email outreach needs. All plans include AI-powered personalization.
                </p>

                {/* Billing Toggle */}
                <div className="inline-flex items-center gap-4 bg-white rounded-full p-1 shadow-md">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-6 py-2 rounded-full font-semibold transition-all ${billingCycle === 'monthly'
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-6 py-2 rounded-full font-semibold transition-all ${billingCycle === 'yearly'
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Yearly
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Save 20%
                        </span>
                    </button>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-7xl mx-auto px-6 pb-20">
                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${plan.popular ? 'ring-4 ring-purple-600 scale-105' : ''
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                <p className="text-gray-600 mb-6">{plan.description}</p>

                                <div className="mb-6">
                                    <span className="text-5xl font-black text-gray-900">{plan.price}</span>
                                    <span className="text-gray-600 ml-2">/ {plan.period}</span>
                                </div>

                                <Link
                                    href={plan.href}
                                    className={`block w-full py-3 rounded-lg font-semibold text-center transition-all mb-8 ${plan.popular
                                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg'
                                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                        }`}
                                >
                                    {plan.cta}
                                </Link>

                                <ul className="space-y-4">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white py-20">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <div className="border-b border-gray-200 pb-6">
                            <h3 className="text-lg font-semibold mb-2">Can I change plans later?</h3>
                            <p className="text-gray-600">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
                        </div>
                        <div className="border-b border-gray-200 pb-6">
                            <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
                            <p className="text-gray-600">We accept all major credit cards (Visa, MasterCard, American Express) via Stripe.</p>
                        </div>
                        <div className="border-b border-gray-200 pb-6">
                            <h3 className="text-lg font-semibold mb-2">Is there a free trial?</h3>
                            <p className="text-gray-600">Yes! The Free plan is available forever. Pro and Business plans come with a 14-day trial.</p>
                        </div>
                        <div className="pb-6">
                            <h3 className="text-lg font-semibold mb-2">Can I cancel anytime?</h3>
                            <p className="text-gray-600">Absolutely. You can cancel your subscription at any time with no penalties or fees.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-16">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Ready to supercharge your email outreach?
                    </h2>
                    <p className="text-xl text-purple-100 mb-8">
                        Join thousands of professionals using AI-powered email campaigns
                    </p>
                    <Link
                        href="/auth/signup"
                        className="inline-block px-8 py-4 bg-white text-purple-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-xl"
                    >
                        Start Free Today →
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12">
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
