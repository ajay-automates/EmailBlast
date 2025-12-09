import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'


interface Campaign {
  id: string
  name: string
  status: string
  created_at: string
  subject_line: string
}

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const res = await fetch('/api/campaigns', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        setCampaigns(data)
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const createNewCampaign = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: 'New Campaign',
          subjectLine: '',
          context: '',
        }),
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/dashboard/${data.id}`)
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading campaigns...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-aurora text-apple-text pb-20 selection:bg-purple-500/20">
      {/* Apple-style Glass Navigation */}
      <nav className="sticky top-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 hover-lift">
            {/* Simple Logo Icon */}
            <div className="w-9 h-9 bg-black rounded-xl text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-black/10">E</div>
            <span className="font-semibold text-xl tracking-tight text-gray-900">EmailBlast</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium text-gray-500">
            <Link href="/dashboard" className="text-gray-900 hover:text-primary transition-colors">Campaigns</Link>
            <Link href="/dashboard/sent" className="hover:text-primary transition-colors">History</Link>
            <Link href="/dashboard/settings" className="hover:text-primary transition-colors">Settings</Link>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shadow-inner" />
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-16">
        <div className="flex justify-between items-end mb-12 animate-[fadeIn_0.5s_ease-out]">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-2">Campaigns</h1>
            <p className="text-xl text-secondary font-medium">Manage and track your outreach.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard/sent" className="btn-secondary flex items-center gap-2">
              <span className="text-lg">📨</span> History
            </Link>
            <button
              onClick={createNewCampaign}
              className="btn-primary flex items-center gap-2 backdrop-blur-none"
            >
              <span className="text-lg">+</span> New Campaign
            </button>
          </div>
        </div>

        {campaigns.length === 0 ? (
          <div className="card text-center py-32 flex flex-col items-center justify-center border-dashed border-2 border-gray-200/50 bg-white/40">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center text-4xl mb-8 shadow-sm">✨</div>
            <h3 className="text-3xl font-bold mb-3 text-gray-900">No campaigns yet</h3>
            <p className="text-secondary text-lg mb-10 max-w-md">Get started by creating your first email campaign using our AI-powered tools.</p>
            <button
              onClick={createNewCampaign}
              className="btn-primary transform scale-110"
            >
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((campaign) => (
              <Link href={`/dashboard/${campaign.id}`} key={campaign.id} className="group outline-none">
                <div className="card h-full flex flex-col justify-between group-hover:border-primary/20 group-focus:ring-4 ring-primary/20">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-sm ${campaign.status === 'sent' ? 'bg-green-100/80 text-green-700 backdrop-blur-md' : 'bg-gray-100/80 text-gray-600 backdrop-blur-md'
                        }`}>
                        {campaign.status}
                      </span>
                      <span className="text-xs text-secondary font-medium font-mono">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight group-hover:text-primary transition-colors">
                      {campaign.name}
                    </h3>
                    <p className="text-secondary text-sm leading-relaxed line-clamp-2">
                      {campaign.subject_line || 'No subject line set'}
                    </p>
                  </div>
                  <div className="mt-8 pt-6 border-t border-gray-100/50 flex items-center text-primary font-semibold text-sm group-hover:translate-x-1 transition-transform">
                    View Details <span className="ml-1">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
