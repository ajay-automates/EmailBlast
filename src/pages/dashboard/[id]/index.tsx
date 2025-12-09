import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import '../../../styles/globals.css'

interface Campaign {
  id: string
  name: string
  subject_line: string
  context: string
  status: string
}

interface Contact {
  id: string
  first_name: string
  last_name: string
  email: string
  company: string
}

export default function CampaignDetail() {
  const router = useRouter()
  const { id } = router.query
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [subjectLine, setSubjectLine] = useState('')
  const [context, setContext] = useState('')

  useEffect(() => {
    if (id) {
      fetchCampaign()
    }
  }, [id])

  const fetchCampaign = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`/api/campaigns/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        setCampaign(data)
        setName(data.name)
        setSubjectLine(data.subject_line)
        setContext(data.context)
        fetchContacts()
      }
    } catch (error) {
      console.error('Error fetching campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`/api/campaigns/${id}/contacts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        setContacts(data)
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
    }
  }

  const saveCampaign = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          subjectLine,
          context,
        }),
      })
      if (res.ok) {
        alert('Campaign saved successfully!')
      }
    } catch (error) {
      console.error('Error saving campaign:', error)
      alert('Failed to save campaign')
    } finally {
      setSaving(false)
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Campaigns
        </Link>

        <div className="card mb-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Campaign Details</h1>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="e.g., Getting 50 leads"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject Line
              </label>
              <input
                type="text"
                value={subjectLine}
                onChange={(e) => setSubjectLine(e.target.value)}
                className="input-field"
                placeholder="e.g., Hey {firstName}, quick question"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Context for AI (personalization instructions)
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="input-field h-32"
                placeholder="e.g., Software engineers at mid-market SaaS companies. Focus on how our tool saves them 5 hours per week."
              />
            </div>

            <button
              onClick={saveCampaign}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving...' : 'Save Campaign'}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Contacts ({contacts.length})</h2>
            <Link
              href={`/dashboard/${id}/upload`}
              className="btn-primary"
            >
              Import CSV
            </Link>
          </div>

          {contacts.length === 0 ? (
            <p className="text-gray-600">No contacts imported yet. Upload a CSV to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Company</th>
                    <th className="px-4 py-2 text-left">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{contact.first_name} {contact.last_name}</td>
                      <td className="px-4 py-2 text-blue-600">{contact.email}</td>
                      <td className="px-4 py-2">{contact.company}</td>
                      <td className="px-4 py-2">{contact.position}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
