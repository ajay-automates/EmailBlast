import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function OneClickOutbound() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<any>(null);
    const [openModal, setOpenModal] = useState(false);

    // Form Inputs
    const [industry, setIndustry] = useState('');
    const [ctaLink, setCtaLink] = useState('');
    const [valueProp, setValueProp] = useState('');

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        const res = await fetch('/api/outbound/status');
        if (res.ok) {
            const data = await res.json();
            setStatus(data);
        }
    };

    const handleRun = async () => {
        if (!industry || !ctaLink) return;

        setLoading(true);
        try {
            const res = await fetch('/api/outbound/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ industry, ctaLink, valueProp })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            // Redirect to review page
            router.push(`/dashboard/${data.campaignId}/review`);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!status) return <div className="animate-pulse h-32 bg-gray-100 rounded-xl"></div>;

    const isLocked = !status.canRun;
    const timeLeft = status.timeUntilNext ? new Date(status.timeUntilNext).toLocaleTimeString() : '';

    return (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-500/30 text-blue-100 text-xs font-bold px-3 py-1 rounded-full border border-blue-400/30">
                            V2 FEATURE
                        </span>
                        <h2 className="text-2xl font-bold">One-Click AI Outbound</h2>
                    </div>
                    <p className="text-blue-100 max-w-xl">
                        Find 10 filtered leads, enrich them with AI, and launch a personalized campaign instantly.
                        {isLocked && <span className="font-bold text-yellow-300 block mt-2">⚠️ Daily limit reached. Next run available at {timeLeft}.</span>}
                    </p>
                </div>

                <button
                    onClick={() => setOpenModal(true)}
                    disabled={isLocked}
                    className="whitespace-nowrap bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                    {isLocked ? 'Cooldown Active ⏳' : 'Find 10 Leads & Start 🚀'}
                </button>
            </div>

            {/* Modal */}
            {openModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white text-gray-900 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Configure Daily Run</h3>
                            <button onClick={() => setOpenModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Target Industry</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. SaaS, Marketing Agencies, Real Estate"
                                    value={industry}
                                    onChange={e => setIndustry(e.target.value)}
                                />
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {['SaaS Startups', 'Marketing Agencies', 'Real Estate', 'E-commerce Brands', 'B2B Services'].map((item) => (
                                        <button
                                            key={item}
                                            onClick={() => setIndustry(item)}
                                            className="text-xs bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 px-3 py-1.5 rounded-full border border-gray-200 transition-colors"
                                        >
                                            + {item}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Your Value Prop (Short)</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    placeholder="e.g. We help agents close 3x more deals with AI automation."
                                    rows={2}
                                    value={valueProp}
                                    onChange={e => setValueProp(e.target.value)}
                                />
                                <div className="flex flex-col gap-2 mt-2">
                                    {[
                                        'We help you book 10+ qualified meetings per month.',
                                        'We automate your busywork so you save 20h/week.',
                                        'We help you cut operational costs by 30% with AI.',
                                        'We scale your revenue without hiring more staff.'
                                    ].map((item) => (
                                        <button
                                            key={item}
                                            onClick={() => setValueProp(item)}
                                            className="text-left text-xs bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 px-3 py-2 rounded-lg border border-gray-200 transition-colors truncate"
                                        >
                                            ✨ {item}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Booking Link / CTA</label>
                                <input
                                    type="url"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="https://calendly.com/your-name"
                                    value={ctaLink}
                                    onChange={e => setCtaLink(e.target.value)}
                                />
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                                <p><strong>⚡ How this works:</strong></p>
                                <ul className="list-disc ml-4 mt-1 space-y-1">
                                    <li>AI will find <strong>10 CEO/Founders</strong> in the US.</li>
                                    <li>It will verify emails & check for duplicates.</li>
                                    <li>It will auto-write & schedule personalized emails.</li>
                                    <li>Limit: Once per 24 hours.</li>
                                </ul>
                            </div>

                            <button
                                onClick={handleRun}
                                disabled={loading || !industry || !ctaLink}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Sourcing Leads...
                                    </>
                                ) : (
                                    'Launch Campaign 🚀'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
