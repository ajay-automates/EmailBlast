import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'


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
  position: string
}

export default function CampaignDetail() {
  const router = useRouter()
  const { id } = router.query
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])
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

  const toggleSelectAll = () => {
    if (selectedContactIds.length === contacts.length) {
      setSelectedContactIds([])
    } else {
      setSelectedContactIds(contacts.map(c => c.id))
    }
  }

  const toggleSelect = (contactId: string) => {
    if (selectedContactIds.includes(contactId)) {
      setSelectedContactIds(selectedContactIds.filter(id => id !== contactId))
    } else {
      setSelectedContactIds([...selectedContactIds, contactId])
    }
  }

  const getActionUrl = (base: string) => {
    if (selectedContactIds.length > 0) {
      return `${base}?contacts=${selectedContactIds.join(',')}`
    }
    return base
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg text-white flex items-center justify-center font-bold text-lg">E</div>
            <span className="font-semibold text-lg tracking-tight">EmailBlast</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
            <Link href="/dashboard" className="text-apple-text">Campaigns</Link>
            <Link href="/dashboard/sent" className="hover:text-primary transition">History</Link>
            <div className="w-8 h-8 rounded-full bg-gray-200" />
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-10">
        <Link href="/dashboard" className="text-primary hover:underline text-sm font-medium mb-6 inline-block">
          ← Campaigns
        </Link>

        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-bold text-apple-text tracking-tight mb-2">{name || 'Untitled Campaign'}</h1>
            <p className="text-secondary text-lg">Manage your settings and audience.</p>
          </div>
          <button
            onClick={saveCampaign}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold mb-6">Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Campaign Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    placeholder="Campaign Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject Line</label>
                  <input
                    type="text"
                    value={subjectLine}
                    onChange={(e) => setSubjectLine(e.target.value)}
                    className="input-field"
                    placeholder="Email Subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">AI Context</label>
                  <textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="input-field h-40 resize-none"
                    placeholder="Instructions for the AI..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contacts Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card min-h-[600px]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold">Audience</h2>
                  <p className="text-secondary text-sm">{contacts.length} contacts • {selectedContactIds.length} selected</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/${id}/upload`} className="btn-secondary text-sm px-4 py-1">Import</Link>
                  <Link href={getActionUrl(`/dashboard/${id}/generate`)} className="btn-primary text-sm px-4 py-1 bg-gray-900 hover:bg-black">Generate & Send →</Link>
                </div>
              </div>

              {contacts.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                  <p className="text-secondary mb-4">No contacts yet.</p>
                  <Link href={`/dashboard/${id}/upload`} className="text-primary font-medium hover:underline">Upload CSV</Link>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                      <tr>
                        <th className="px-4 py-3 w-10">
                          <input type="checkbox" checked={contacts.length > 0 && selectedContactIds.length === contacts.length} onChange={toggleSelectAll}
                            className="rounded-md border-gray-300 text-primary focus:ring-primary" />
                        </th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {contacts.map((contact) => (
                        <tr key={contact.id} className={`hover:bg-gray-50 transition-colors ${selectedContactIds.includes(contact.id) ? 'bg-blue-50/50' : ''}`}>
                          <td className="px-4 py-3">
                            <input type="checkbox" checked={selectedContactIds.includes(contact.id)} onChange={() => toggleSelect(contact.id)}
                              className="rounded-md border-gray-300 text-primary focus:ring-primary" />
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">{contact.first_name} {contact.last_name}</td>
                          <td className="px-4 py-3 text-secondary">{contact.email}</td>
                          <td className="px-4 py-3 text-gray-400">{contact.company} • {contact.position}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
