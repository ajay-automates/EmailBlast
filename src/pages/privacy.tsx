import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
                <p className="text-gray-600 mb-8">Last updated: December 10, 2025</p>

                <div className="prose prose-lg max-w-none">
                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
                    <p className="text-gray-600 mb-4">
                        We collect information you provide directly to us, including:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 mb-6">
                        <li>Account information (name, email, company)</li>
                        <li>Contact lists you upload (names, emails, companies)</li>
                        <li>Email campaign data and analytics</li>
                        <li>Payment information (processed securely by Stripe)</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
                    <p className="text-gray-600 mb-4">
                        We use the information we collect to:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 mb-6">
                        <li>Provide, maintain, and improve our services</li>
                        <li>Generate personalized emails using AI</li>
                        <li>Send emails on your behalf via SendGrid</li>
                        <li>Track email performance (opens, clicks, replies)</li>
                        <li>Process payments and manage subscriptions</li>
                        <li>Send you service updates and support messages</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Data Security</h2>
                    <p className="text-gray-600 mb-6">
                        We implement industry-standard security measures to protect your data:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 mb-6">
                        <li>End-to-end encryption for data transmission</li>
                        <li>Secure password hashing with bcrypt</li>
                        <li>Regular security audits and updates</li>
                        <li>Restricted access to personal data</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Data Sharing</h2>
                    <p className="text-gray-600 mb-6">
                        We do not sell your personal information. We share data only with:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 mb-6">
                        <li><strong>SendGrid:</strong> To send emails on your behalf</li>
                        <li><strong>OpenAI:</strong> To generate email content</li>
                        <li><strong>Stripe:</strong> To process payments</li>
                        <li><strong>Supabase:</strong> To store your data securely</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Your Rights</h2>
                    <p className="text-gray-600 mb-4">
                        You have the right to:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 mb-6">
                        <li>Access your personal data</li>
                        <li>Correct inaccurate data</li>
                        <li>Delete your account and data</li>
                        <li>Export your data in CSV format</li>
                        <li>Opt out of marketing communications</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. GDPR Compliance</h2>
                    <p className="text-gray-600 mb-6">
                        For users in the European Union, we comply with GDPR requirements:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 mb-6">
                        <li>Lawful basis for processing your data</li>
                        <li>Right to data portability</li>
                        <li>Right to be forgotten</li>
                        <li>Data breach notification within 72 hours</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Cookies</h2>
                    <p className="text-gray-600 mb-6">
                        We use essential cookies for authentication and session management. We do not use
                        tracking cookies for advertising.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Data Retention</h2>
                    <p className="text-gray-600 mb-6">
                        We retain your data for as long as your account is active. When you delete your account,
                        we permanently delete all your data within 30 days.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Changes to This Policy</h2>
                    <p className="text-gray-600 mb-6">
                        We may update this privacy policy from time to time. We will notify you of any changes
                        by posting the new policy on this page and updating the "Last updated" date.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Contact Us</h2>
                    <p className="text-gray-600 mb-6">
                        If you have questions about this privacy policy, please contact us at:
                        <br />
                        <a href="mailto:privacy@emailblast.com" className="text-blue-600 hover:underline">
                            privacy@emailblast.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
