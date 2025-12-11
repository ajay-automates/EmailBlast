import Link from 'next/link';

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-white">
            <nav className="border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="text-2xl font-bold text-blue-600">
                            EmailBlast
                        </Link>
                        <Link href="/" className="text-gray-700 hover:text-gray-900">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
                <p className="text-gray-600 mb-8">Last updated: December 10, 2025</p>

                <div className="prose prose-lg max-w-none">
                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
                    <p className="text-gray-600 mb-6">
                        By accessing and using EmailBlast, you accept and agree to be bound by these Terms of Service.
                        If you do not agree to these terms, please do not use our service.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
                    <p className="text-gray-600 mb-6">
                        EmailBlast provides an AI-powered email outreach automation platform that allows you to:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 mb-6">
                        <li>Upload contact lists</li>
                        <li>Generate personalized emails using AI</li>
                        <li>Send emails via SendGrid</li>
                        <li>Track email performance (opens, clicks, replies)</li>
                        <li>Manage email campaigns</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. User Responsibilities</h2>
                    <p className="text-gray-600 mb-4">
                        You agree to:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 mb-6">
                        <li>Provide accurate and complete information</li>
                        <li>Maintain the security of your account</li>
                        <li>Comply with all applicable laws and regulations</li>
                        <li>Not use the service for spam or illegal activities</li>
                        <li>Only send emails to contacts who have a legitimate business relationship with you</li>
                        <li>Include an unsubscribe link in all emails</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Prohibited Uses</h2>
                    <p className="text-gray-600 mb-4">
                        You may not use EmailBlast to:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 mb-6">
                        <li>Send spam or unsolicited commercial emails</li>
                        <li>Violate CAN-SPAM Act or GDPR regulations</li>
                        <li>Send malicious content or phishing emails</li>
                        <li>Harass, abuse, or harm others</li>
                        <li>Impersonate any person or entity</li>
                        <li>Violate any laws or regulations</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Subscription and Billing</h2>
                    <p className="text-gray-600 mb-6">
                        <strong>Free Plan:</strong> 50 emails per month, no credit card required.
                        <br />
                        <strong>Pro Plan:</strong> ₹1,000/month, 5,000 emails per month.
                        <br />
                        <strong>Business Plan:</strong> ₹5,000/month, unlimited emails.
                    </p>
                    <p className="text-gray-600 mb-6">
                        Subscriptions are billed monthly. You can cancel anytime. No refunds for partial months.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Account Termination</h2>
                    <p className="text-gray-600 mb-6">
                        We reserve the right to suspend or terminate your account if you:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 mb-6">
                        <li>Violate these Terms of Service</li>
                        <li>Use the service for spam or illegal activities</li>
                        <li>Fail to pay subscription fees</li>
                        <li>Engage in abusive behavior</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Data Ownership</h2>
                    <p className="text-gray-600 mb-6">
                        You retain ownership of all data you upload to EmailBlast. We do not claim any rights
                        to your contact lists or email content. You can export your data at any time.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Service Availability</h2>
                    <p className="text-gray-600 mb-6">
                        We strive for 99.9% uptime but do not guarantee uninterrupted service. We may perform
                        maintenance that temporarily affects availability.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Limitation of Liability</h2>
                    <p className="text-gray-600 mb-6">
                        EmailBlast is provided "as is" without warranties of any kind. We are not liable for:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 mb-6">
                        <li>Lost revenue or business opportunities</li>
                        <li>Email deliverability issues</li>
                        <li>Third-party service failures (SendGrid, OpenAI)</li>
                        <li>Data loss or corruption</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Indemnification</h2>
                    <p className="text-gray-600 mb-6">
                        You agree to indemnify and hold harmless EmailBlast from any claims arising from your
                        use of the service or violation of these terms.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Changes to Terms</h2>
                    <p className="text-gray-600 mb-6">
                        We may update these terms from time to time. We will notify you of significant changes
                        via email. Continued use of the service constitutes acceptance of the new terms.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Governing Law</h2>
                    <p className="text-gray-600 mb-6">
                        These terms are governed by the laws of India. Any disputes will be resolved in the
                        courts of India.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. Contact Us</h2>
                    <p className="text-gray-600 mb-6">
                        If you have questions about these terms, please contact us at:
                        <br />
                        <a href="mailto:legal@emailblast.com" className="text-blue-600 hover:underline">
                            legal@emailblast.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
