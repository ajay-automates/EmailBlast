import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'


interface EmailVariation {
  id: string
  variation_number: number
  subject: string
  body: string
  contact: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
}

interface Contact {
  id: string
  first_name: string
  last_name: string
  email: string
}

export default function GenerateEmails() {
  const router = useRouter()
  const { id } = router.query
  const [contacts, setContacts] = useState<Contact[]>([])
  const [variations, setVariations] = useState<EmailVariation[]>([])
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedVariations, setSelectedVariations] = useState<string[]>([])
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (id) {
      fetchContacts()
    }
  }, [id])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`/api/campaigns/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.ok) {
        const campaign = await res.json()
        // Get contacts from campaign
        const contactsRes = await fetch(`/api/campaigns/${id}/contacts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (contactsRes.ok) {
          const contactsData = await contactsRes.json()

          // Filter by selected contacts if query param exists
          const selectedIds = (router.query.contacts as string)?.split(',')
          if (selectedIds && selectedIds.length > 0) {
            setContacts(contactsData.filter((c: Contact) => selectedIds.includes(c.id)))
          } else {
            setContacts(contactsData)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching:', error)
      setError('Failed to load campaign data')
    } finally {
      setLoading(false)
    }
  }

  const generateVariations = async () => {
    if (contacts.length === 0) {
      setError('No contacts to generate emails for')
      return
    }

    try {
      setGenerating(true)
      setError('')
      setStatus('Generating email variations...')

      const token = localStorage.getItem('auth_token')
      const res = await fetch(`/api/campaigns/${id}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contactIds: contacts.map(c => c.id),
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to generate variations')
      }

      const data = await res.json()
      setStatus(`✅ Generated ${data.generated} email variations!`)

      // Wait a moment then redirect to send page
      setTimeout(() => {
        router.push(`/dashboard/${id}/send`)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Generation failed')
      setStatus('')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-aurora text-apple-text pb-20 selection:bg-purple-500/20">
      {/* Apple-style Glass Navigation */}
      <nav className="sticky top-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 hover-lift">
            <div className="w-9 h-9 bg-black rounded-xl text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-black/10">E</div>
            <span className="font-semibold text-xl tracking-tight text-gray-900">EmailBlast</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium text-gray-500">
            <Link href="/dashboard" className="hover:text-primary transition-colors">Campaigns</Link>
            <Link href="/dashboard/sent" className="hover:text-primary transition-colors">History</Link>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shadow-inner" />
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-10 animate-[fadeIn_0.5s_ease-out]">
        <Link href={`/dashboard/${id}`} className="text-secondary hover:text-primary transition-colors text-sm font-medium mb-8 inline-flex items-center gap-1 group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Campaign
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">Generate Emails</h1>
            <p className="text-secondary text-lg">AI will craft personalized variations for your audience.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Summary</h2>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <div className="text-4xl font-bold text-primary mb-1">{contacts.length}</div>
                  <div className="text-sm font-medium text-gray-600">Recipients Selected</div>
                </div>
                <div className="p-6 bg-purple-50/50 rounded-2xl border border-purple-100">
                  <div className="text-4xl font-bold text-purple-600 mb-1">{contacts.length * 5}</div>
                  <div className="text-sm font-medium text-gray-600">Total Emails (5x each)</div>
                </div>
              </div>

              {/* Status Messages */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-3">
                  <span className="text-xl">⚠️</span> {error}
                </div>
              )}

              {status && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-center gap-3">
                  <span className="text-xl">✅</span> {status}
                </div>
              )}

              {/* AI Capabilities */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">What happens next?</h3>
                <ul className="space-y-3">
                  {[
                    'Analyzes contact data (Name, Company, Position)',
                    'Crafts 5 unique variations per contact',
                    'Optimizes for high open-rates and replies',
                    'Prepares draft queue for your review'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-secondary text-sm">
                      <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold">✓</div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-gray-100/50 flex gap-4">
                <button
                  onClick={generateVariations}
                  disabled={generating || contacts.length === 0}
                  className="btn-primary flex-1 h-12 text-lg shadow-blue-500/20"
                >
                  {generating ? '✨ Generating Magic...' : 'Start Generation'}
                </button>
                <button
                  onClick={() => router.push(`/dashboard/${id}`)}
                  disabled={generating}
                  className="btn-secondary h-12 px-8"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 bg-yellow-50/30 border-yellow-100/50">
              <div className="flex items-center gap-2 mb-4 text-yellow-700 font-bold">
                <span className="text-xl">💡</span> Pro Tips
              </div>
              <ul className="space-y-4 text-sm text-gray-600">
                <li className="leading-relaxed">
                  <strong>Context is key:</strong> Ensure your campaign context clearly explains your value proposition for the best AI results.
                </li>
                <li className="leading-relaxed">
                  <strong>Review process:</strong> You'll have a chance to review all generated emails before they are actually sent.
                </li>
                <li className="leading-relaxed">
                  <strong>Time estimate:</strong> It typically takes about 2 seconds per contact to generate high-quality personalized drafts.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
