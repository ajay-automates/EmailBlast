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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Email Campaigns</h1>
          <div className="flex gap-4">
            <Link href="/dashboard/sent" className="btn-secondary flex items-center">
              📨 Sent History
            </Link>
            <button
              onClick={createNewCampaign}
              className="btn-primary"
            >
              + New Campaign
            </button>
          </div>
        </div>

        {campaigns.length === 0 ? (
          <div className="card text-center">
            <p className="text-gray-600 mb-4">No campaigns yet. Create your first one!</p>
            <button
              onClick={createNewCampaign}
              className="btn-primary"
            >
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {campaigns.map((campaign) => (
              <Link href={`/dashboard/${campaign.id}`} key={campaign.id}>
                <div className="card cursor-pointer hover:shadow-lg transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {campaign.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Subject: {campaign.subject_line || 'Not set'}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Created: {new Date(campaign.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
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
