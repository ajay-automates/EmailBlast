import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Custom404() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center px-6">
            <div className="max-w-2xl w-full text-center">
                {/* Animated 404 */}
                <div className="mb-8 relative">
                    <h1 className="text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 leading-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 bg-white/50 rounded-full blur-3xl"></div>
                    </div>
                </div>

                {/* Message */}
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Page Not Found
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                    Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
                </p>

                {/* Actions */}
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:border-gray-300 transition-all"
                    >
                        ← Go Back
                    </button>
                    <Link
                        href="/dashboard"
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
                    >
                        Go to Dashboard
                    </Link>
                </div>

                {/* Quick Links */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-4">Quick Links:</p>
                    <div className="flex gap-6 justify-center text-sm">
                        <Link href="/" className="text-purple-600 hover:text-purple-800">
                            Home
                        </Link>
                        <Link href="/pricing" className="text-purple-600 hover:text-purple-800">
                            Pricing
                        </Link>
                        <Link href="/contact" className="text-purple-600 hover:text-purple-800">
                            Contact
                        </Link>
                        <Link href="/faq" className="text-purple-600 hover:text-purple-800">
                            FAQ
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
