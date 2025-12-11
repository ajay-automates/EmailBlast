import Link from 'next/link';
import { useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function LandingPage() {
    const session = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session) {
            router.push('/dashboard');
        }
    }, [session, router]);

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-blue-600">EmailBlast</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link href="#features" className="text-gray-700 hover:text-gray-900">
                                Features
                            </Link>
                            <Link href="#pricing" className="text-gray-700 hover:text-gray-900">
                                Pricing
                            </Link>
                            <Link href="#faq" className="text-gray-700 hover:text-gray-900">
                                FAQ
                            </Link>
                            <Link
                                href="/auth/login"
                                className="text-gray-700 hover:text-gray-900 font-medium"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/auth/signup"
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Start Free
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                            Get More Replies to Your
                            <span className="text-blue-600"> Cold Emails</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            AI-powered email personalization that feels human. Send 1,000 personalized emails in minutes,
                            track opens and clicks, and get 5x more replies.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <Link
                                href="/auth/signup"
                                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
                            >
                                Start Free Trial
                            </Link>
                            <Link
                                href="#demo"
                                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
                            >
                                Watch Demo
                            </Link>
                        </div>
                        <p className="mt-4 text-sm text-gray-500">
                            Free plan • No credit card required • 50 emails/month
                        </p>
                    </div>
                </div>
            </section>

            {/* Problem Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Cold Email is Broken
                        </h2>
                        <p className="text-xl text-gray-600">
                            Your sales team wastes 20+ hours per week on manual emails
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center p-6">
                            <div className="text-4xl mb-4">⏰</div>
                            <h3 className="text-xl font-semibold mb-2">Too Time-Consuming</h3>
                            <p className="text-gray-600">
                                Writing personalized emails takes 2+ hours per 50 contacts
                            </p>
                        </div>
                        <div className="text-center p-6">
                            <div className="text-4xl mb-4">📧</div>
                            <h3 className="text-xl font-semibold mb-2">Low Open Rates</h3>
                            <p className="text-gray-600">
                                Generic emails get 2-3% open rate (industry average is 5-10%)
                            </p>
                        </div>
                        <div className="text-center p-6">
                            <div className="text-4xl mb-4">🔍</div>
                            <h3 className="text-xl font-semibold mb-2">No Tracking</h3>
                            <p className="text-gray-600">
                                Flying blind on who opened, clicked, or replied
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Solution Section */}
            <section id="features" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Automate Your Cold Outreach
                        </h2>
                        <p className="text-xl text-gray-600">
                            Send personalized emails at scale with AI
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl">🤖</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">AI Generates Personalized Emails</h3>
                                <p className="text-gray-600">
                                    Upload CSV of contacts. AI creates 5 variations per person, personalized by name, company, and role.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl">📤</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Send at Scale</h3>
                                <p className="text-gray-600">
                                    Batch sending via SendGrid. Send 1,000+ emails with optimal timing and verified deliverability.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl">📊</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Track Everything in Real-Time</h3>
                                <p className="text-gray-600">
                                    Live dashboard shows opens, clicks, and replies as they happen. Know exactly who to follow up with.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl">⚡</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Automatic Follow-ups</h3>
                                <p className="text-gray-600">
                                    Schedule follow-ups for day 3, 7, and 14. Only to non-responders. Multiply reply rate by 3-5x.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-600">
                            3 simple steps to start getting more replies
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                1
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Upload Your Contacts</h3>
                            <p className="text-gray-600">
                                Import CSV with names, emails, and companies
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                2
                            </div>
                            <h3 className="text-xl font-semibold mb-2">AI Generates Emails</h3>
                            <p className="text-gray-600">
                                Choose tone and context → AI creates 5 variations per contact
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                3
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Send & Track</h3>
                            <p className="text-gray-600">
                                Send with 1 click, watch replies come in real-time
                            </p>
                        </div>
                    </div>
                    <div className="text-center mt-12">
                        <p className="text-lg text-gray-600 mb-4">
                            <strong>Time:</strong> 15 minutes setup, 5 minutes to send 1,000 emails
                        </p>
                        <Link
                            href="/auth/signup"
                            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Try It Free
                        </Link>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="text-xl text-gray-600">
                            Start free, upgrade as you grow
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Free Plan */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
                            <h3 className="text-2xl font-bold mb-2">Free</h3>
                            <div className="mb-6">
                                <span className="text-4xl font-bold">$0</span>
                                <span className="text-gray-600">/month</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    50 emails/month
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    AI email generation
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Open tracking
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Analytics dashboard
                                </li>
                            </ul>
                            <Link
                                href="/auth/signup"
                                className="block w-full text-center bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Start Free
                            </Link>
                        </div>

                        {/* Pro Plan */}
                        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-600 relative">
                            <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
                                Popular
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Pro</h3>
                            <div className="mb-6">
                                <span className="text-4xl font-bold">₹1,000</span>
                                <span className="text-gray-600">/month</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    5,000 emails/month
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Everything in Free
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Click tracking
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Reply detection
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Follow-up sequences
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    API access
                                </li>
                            </ul>
                            <Link
                                href="/auth/signup"
                                className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Upgrade to Pro
                            </Link>
                        </div>

                        {/* Business Plan */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
                            <h3 className="text-2xl font-bold mb-2">Business</h3>
                            <div className="mb-6">
                                <span className="text-4xl font-bold">₹5,000</span>
                                <span className="text-gray-600">/month</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Unlimited emails
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Everything in Pro
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Dedicated support
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Custom domains
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Team features
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    SLA guarantee
                                </li>
                            </ul>
                            <Link
                                href="/auth/signup"
                                className="block w-full text-center bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                            >
                                Contact Sales
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Frequently Asked Questions
                        </h2>
                    </div>
                    <div className="space-y-6">
                        <details className="bg-gray-50 p-6 rounded-lg">
                            <summary className="font-semibold text-lg cursor-pointer">
                                How is this different from Mailchimp?
                            </summary>
                            <p className="mt-3 text-gray-600">
                                Mailchimp is for newsletters to existing subscribers. EmailBlast is for cold outreach to new prospects.
                                We use AI to personalize 1:1 emails that feel human, not mass marketing.
                            </p>
                        </details>
                        <details className="bg-gray-50 p-6 rounded-lg">
                            <summary className="font-semibold text-lg cursor-pointer">
                                Will my emails go to spam?
                            </summary>
                            <p className="mt-3 text-gray-600">
                                We use SendGrid with industry-leading 99.9% inbox rate. We follow email best practices including
                                sender verification, warm-up sequences, and proper authentication (SPF, DKIM, DMARC).
                            </p>
                        </details>
                        <details className="bg-gray-50 p-6 rounded-lg">
                            <summary className="font-semibold text-lg cursor-pointer">
                                How long until I get replies?
                            </summary>
                            <p className="mt-3 text-gray-600">
                                First replies usually come within 24 hours of sending. This depends on your list quality and email
                                content. Average reply rate is 1-5% for cold emails.
                            </p>
                        </details>
                        <details className="bg-gray-50 p-6 rounded-lg">
                            <summary className="font-semibold text-lg cursor-pointer">
                                Can I export my data?
                            </summary>
                            <p className="mt-3 text-gray-600">
                                Yes! All data is exportable as CSV. No lock-in. You own your data.
                            </p>
                        </details>
                        <details className="bg-gray-50 p-6 rounded-lg">
                            <summary className="font-semibold text-lg cursor-pointer">
                                Do you have an API?
                            </summary>
                            <p className="mt-3 text-gray-600">
                                Yes, Pro and Business plans include full API access for advanced integrations with your existing tools.
                            </p>
                        </details>
                        <details className="bg-gray-50 p-6 rounded-lg">
                            <summary className="font-semibold text-lg cursor-pointer">
                                What if I'm not technical?
                            </summary>
                            <p className="mt-3 text-gray-600">
                                EmailBlast is fully no-code. Just upload a CSV, choose your settings, and click send. If you get stuck,
                                we have support to help you.
                            </p>
                        </details>
                        <details className="bg-gray-50 p-6 rounded-lg">
                            <summary className="font-semibold text-lg cursor-pointer">
                                Is there a contract?
                            </summary>
                            <p className="mt-3 text-gray-600">
                                No contract. Cancel anytime. Monthly billing. No questions asked.
                            </p>
                        </details>
                        <details className="bg-gray-50 p-6 rounded-lg">
                            <summary className="font-semibold text-lg cursor-pointer">
                                How do I get started?
                            </summary>
                            <p className="mt-3 text-gray-600">
                                Click "Start Free" above, create an account, and you'll be sending personalized emails in 15 minutes.
                                No credit card required for the free plan.
                            </p>
                        </details>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-blue-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-white mb-4">
                        Ready to Get More Replies?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Start sending personalized emails with AI today. No credit card required.
                    </p>
                    <Link
                        href="/auth/signup"
                        className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
                    >
                        Start Free Trial
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="font-bold text-lg mb-4">Company</h3>
                            <ul className="space-y-2">
                                <li><Link href="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
                                <li><Link href="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                                <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-4">Product</h3>
                            <ul className="space-y-2">
                                <li><Link href="#features" className="text-gray-400 hover:text-white">Features</Link></li>
                                <li><Link href="#pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
                                <li><Link href="/docs" className="text-gray-400 hover:text-white">API Docs</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-4">Legal</h3>
                            <ul className="space-y-2">
                                <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
                                <li><Link href="/gdpr" className="text-gray-400 hover:text-white">GDPR</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-4">Connect</h3>
                            <ul className="space-y-2">
                                <li><a href="https://twitter.com" className="text-gray-400 hover:text-white">Twitter</a></li>
                                <li><a href="https://linkedin.com" className="text-gray-400 hover:text-white">LinkedIn</a></li>
                                <li><a href="https://github.com" className="text-gray-400 hover:text-white">GitHub</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2025 EmailBlast. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
