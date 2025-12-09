import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import '../../../styles/globals.css'

interface Analytics {
  totalSent: number
  opened: number
  clicked: number
  replied: number
  bounced: number
  openRate: string
  clickRate: string
  replyRate: string
  bounceRate: string
}

export default function CampaignAnalytics() {
  const router = useRouter()
  const { id } = router.query
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (id) {
      fetchAnalytics()
      // Auto-refresh every 10 seconds
      const interval = setInterval(fetchAnalytics, 10000)
      return () => clearInterval(interval)
    }
  }, [id])

  const fetchAnalytics = async () => {
    try {
      if (!refreshing) setLoading(true)
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`/api/campaigns/${id}/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const manualRefresh = () => {
    setRefreshing(true)
    fetchAnalytics()
  }

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading analytics...</div>
      </div>
    )
  }

  const metrics = [
    {
      label: 'Total Sent',
      value: analytics.totalSent,
      icon: '📧',
      color: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Opened',
      value: analytics.opened,
      rate: analytics.openRate,
      icon: '👀',
      color: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Clicked',
      value: analytics.clicked,
      rate: analytics.clickRate,
      icon: '🔗',
      color: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      label: 'Replied',
      value: analytics.replied,
      rate: analytics.replyRate,
      icon: '💬',
      color: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      label: 'Bounced',
      value: analytics.bounced,
      rate: analytics.bounceRate,
      icon: '⚠️',
      color: 'bg-red-50',
      textColor: 'text-red-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <Link href={`/dashboard/${id}`} className="text-blue-600 hover:text-blue-800">
            ← Back to Campaign
          </Link>
          <button
            onClick={manualRefresh}
            disabled={refreshing}
            className="btn-secondary text-sm"
          >
            {refreshing ? '⏳ Refreshing...' : '🔄 Refresh'}
          </button>
        </div>

        {/* Header */}
        <div className="card mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Campaign Analytics</h1>
          <p className="text-gray-600">Real-time email performance metrics (auto-refreshes every 10 seconds)</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {metrics.map((metric) => (
            <div key={metric.label} className={`card ${metric.color}`}>
              <div className="text-3xl mb-2">{metric.icon}</div>
              <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
              <div className="flex items-baseline gap-2">
                <p className={`text-2xl font-bold ${metric.textColor}`}>{metric.value}</p>
                {metric.rate && <p className={`text-sm ${metric.textColor}`}>{metric.rate}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Stats */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Detailed Performance</h2>
          
          <div className="space-y-6">
            {/* Open Rate */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-900">Open Rate</span>
                <span className="text-gray-600">{analytics.opened} / {analytics.totalSent}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition"
                  style={{
                    width: `${(analytics.opened / Math.max(analytics.totalSent, 1)) * 100}%`,
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {analytics.openRate} • Industry avg: 5-10%
              </p>
            </div>

            {/* Click Rate */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-900">Click Rate</span>
                <span className="text-gray-600">{analytics.clicked} / {analytics.totalSent}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-500 h-3 rounded-full transition"
                  style={{
                    width: `${(analytics.clicked / Math.max(analytics.totalSent, 1)) * 100}%`,
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {analytics.clickRate} • Industry avg: 1-3%
              </p>
            </div>

            {/* Reply Rate */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-900">Reply Rate</span>
                <span className="text-gray-600">{analytics.replied} / {analytics.totalSent}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-orange-500 h-3 rounded-full transition"
                  style={{
                    width: `${(analytics.replied / Math.max(analytics.totalSent, 1)) * 100}%`,
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {analytics.replyRate} • Industry avg: 0.5-2%
              </p>
            </div>

            {/* Bounce Rate */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-900">Bounce Rate</span>
                <span className="text-gray-600">{analytics.bounced} / {analytics.totalSent}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full transition"
                  style={{
                    width: `${(analytics.bounced / Math.max(analytics.totalSent, 1)) * 100}%`,
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {analytics.bounceRate} • Industry avg: 1-5%
              </p>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="card bg-blue-50 border-l-4 border-blue-500">
            <h3 className="font-bold text-gray-900 mb-2">💡 Performance Insights</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✅ Open rate: {analytics.openRate}</li>
              <li>✅ Click rate: {analytics.clickRate}</li>
              <li>✅ Reply rate: {analytics.replyRate}</li>
              <li>📊 Total engagement: {Math.round((analytics.opened + analytics.clicked + analytics.replied))} contacts</li>
            </ul>
          </div>

          <div className="card bg-green-50 border-l-4 border-green-500">
            <h3 className="font-bold text-gray-900 mb-2">🎯 Next Steps</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>📧 Follow up with non-responders in 3 days</li>
              <li>🔗 Analyze click patterns</li>
              <li>💬 Review replies and qualifications</li>
              <li>📈 Run A/B tests on subject lines</li>
            </ul>
          </div>
        </div>

        {/* Auto-refresh notice */}
        <div className="text-center text-sm text-gray-500">
          🔄 Analytics update automatically every 10 seconds
        </div>
      </div>
    </div>
  )
}
