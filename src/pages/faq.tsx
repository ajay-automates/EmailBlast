import Link from 'next/link'
import { useState } from 'react'

const faqs = [
    {
        category: 'Getting Started',
        questions: [
            {
                q: 'How do I get started with EmailBlast?',
                a: 'Simply sign up for a free account, create your company profile, upload your contacts, and start generating AI-powered emails. The whole process takes less than 5 minutes!',
            },
            {
                q: 'Do I need a credit card to start?',
                a: 'No! Our Free plan doesn\'t require a credit card. You can start sending emails immediately after signing up.',
            },
            {
                q: 'How does the AI email generation work?',
                a: 'Our AI analyzes your company profile, campaign context, and recipient information to generate personalized email variations. Each email is unique and tailored to the specific recipient.',
            },
        ],
    },
    {
        category: 'Features',
        questions: [
            {
                q: 'What is the Company Profile feature?',
                a: 'The Company Profile lets you save your business details once (name, services, key results, etc.). The AI then uses this information to personalize every email you generate, ensuring consistency and saving time.',
            },
            {
                q: 'Can I use my own email templates?',
                a: 'Yes! Pro and Business plans include custom template support. You can create and save your own templates or use our pre-built industry-specific templates.',
            },
            {
                q: 'Does EmailBlast track email opens and clicks?',
                a: 'Yes! All plans include real-time analytics for opens, clicks, replies, and bounces. You can track the performance of every campaign.',
            },
            {
                q: 'What is reply detection?',
                a: 'Reply detection automatically identifies when a recipient responds to your email and stops sending follow-ups to that contact. This prevents awkward double-messaging.',
            },
        ],
    },
    {
        category: 'Pricing & Plans',
        questions: [
            {
                q: 'Can I upgrade or downgrade my plan?',
                a: 'Absolutely! You can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the end of your current billing cycle.',
            },
            {
                q: 'What happens if I exceed my email limit?',
                a: 'If you reach your monthly email limit, you can either upgrade to a higher plan or wait until your limit resets at the start of the next billing cycle.',
            },
            {
                q: 'Is there a free trial for paid plans?',
                a: 'Yes! Pro and Business plans come with a 14-day free trial. No credit card required to start the trial.',
            },
            {
                q: 'Do you offer refunds?',
                a: 'Yes, we offer a 30-day money-back guarantee on all paid plans. If you\'re not satisfied, contact us for a full refund.',
            },
        ],
    },
    {
        category: 'Technical',
        questions: [
            {
                q: 'Which email providers do you support?',
                a: 'EmailBlast uses SendGrid for email delivery, which ensures high deliverability rates. You can send from any verified email address.',
            },
            {
                q: 'How do I import my contacts?',
                a: 'You can upload contacts via CSV file. Simply include columns for email, first name, last name, company, and position. Our system will automatically map the fields.',
            },
            {
                q: 'Is my data secure?',
                a: 'Yes! We use industry-standard encryption for all data in transit and at rest. We\'re SOC 2 compliant and never share your data with third parties.',
            },
            {
                q: 'Can I integrate EmailBlast with my CRM?',
                a: 'Business plan customers have access to our API, which allows integration with popular CRMs like Salesforce, HubSpot, and Pipedrive.',
            },
        ],
    },
    {
        category: 'Compliance',
        questions: [
            {
                q: 'Is EmailBlast GDPR compliant?',
                a: 'Yes, we are fully GDPR compliant. We provide tools for managing consent, handling data deletion requests, and maintaining compliance.',
            },
            {
                q: 'How do unsubscribes work?',
                a: 'Every email includes an unsubscribe link. When someone unsubscribes, they\'re automatically removed from all future campaigns and marked in your contact list.',
            },
            {
                q: 'Do you support CAN-SPAM compliance?',
                a: 'Yes, all emails include required CAN-SPAM elements like physical address, unsubscribe links, and accurate sender information.',
            },
        ],
    },
]

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<string | null>(null)

    const toggleQuestion = (index: string) => {
        setOpenIndex(openIndex === index ? null : index)
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
                        <Link href="/faq" className="text-gray-900 font-semibold">FAQ</Link>
                        <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
                        <Link href="/auth/login" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold">
                            Login
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-20">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-black text-gray-900 mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-xl text-gray-600">
                        Everything you need to know about EmailBlast
                    </p>
                </div>

                <div className="space-y-12">
                    {faqs.map((category, categoryIndex) => (
                        <div key={categoryIndex}>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">{category.category}</h2>
                            <div className="space-y-4">
                                {category.questions.map((faq, questionIndex) => {
                                    const index = `${categoryIndex}-${questionIndex}`
                                    const isOpen = openIndex === index

                                    return (
                                        <div
                                            key={index}
                                            className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
                                        >
                                            <button
                                                onClick={() => toggleQuestion(index)}
                                                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                            >
                                                <span className="font-semibold text-gray-900">{faq.q}</span>
                                                <svg
                                                    className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''
                                                        }`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </button>
                                            {isOpen && (
                                                <div className="px-6 pb-4 text-gray-600">
                                                    {faq.a}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Still have questions? */}
                <div className="mt-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
                    <p className="text-purple-100 mb-6">
                        Can't find the answer you're looking for? Our support team is here to help.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-block px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-all"
                    >
                        Contact Support
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
