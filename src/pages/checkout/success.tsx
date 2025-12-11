import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
    const router = useRouter();
    const { session_id } = router.query;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session_id) {
            // Give webhook time to process
            setTimeout(() => {
                setLoading(false);
            }, 2000);
        }
    }, [session_id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Processing your payment...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                    <p className="text-gray-600 mb-6">
                        Your subscription has been activated. You can now access all premium features.
                    </p>
                </div>

                <div className="space-y-3">
                    <Link
                        href="/dashboard"
                        className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Go to Dashboard
                    </Link>
                    <Link
                        href="/dashboard/settings"
                        className="block w-full bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                        View Billing
                    </Link>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                        <strong>What's next?</strong><br />
                        Start creating campaigns and sending personalized emails with AI!
                    </p>
                </div>
            </div>
        </div>
    );
}
