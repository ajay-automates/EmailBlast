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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <Link href={`/dashboard/${id}`} className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Campaign
        </Link>

        <div className="card">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Generate Email Variations</h1>
          <p className="text-gray-600 mb-8">AI will generate 5 personalized email variations for each contact</p>

          {/* Status */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          {status && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
              {status}
            </div>
          )}

          {/* Contacts Summary */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="font-bold text-gray-900 mb-2">📊 Generation Summary</h2>
            <p className="text-gray-700">
              <strong>{contacts.length}</strong> contacts selected
            </p>
            <p className="text-gray-700">
              <strong>{contacts.length * 5}</strong> email variations will be generated (5 per contact)
            </p>
            <p className="text-gray-700 text-sm mt-2">
              ⏱️ Estimated time: {Math.ceil(contacts.length * 2 / 60)} minutes
            </p>
          </div>

          {/* What the AI will do */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">🤖 AI Will:</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>✅ Personalize with contact name, company, and position</li>
              <li>✅ Create 5 unique variations with different angles/hooks</li>
              <li>✅ Keep emails concise (50-100 words)</li>
              <li>✅ Include clear calls-to-action</li>
              <li>✅ Sound natural and non-templated</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={generateVariations}
              disabled={generating || contacts.length === 0}
              className="btn-primary"
            >
              {generating ? '⏳ Generating...' : '🚀 Start Generation'}
            </button>
            <button
              onClick={() => router.push(`/dashboard/${id}`)}
              disabled={generating}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>

          {/* Tips */}
          <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">💡 Tips for Best Results</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>📝 <strong>Clear Context:</strong> In campaign settings, write clear context about what you're offering</li>
              <li>🎯 <strong>Specific Audience:</strong> Target emails work better than generic ones</li>
              <li>✍️ <strong>Subject Line Template:</strong> Use variables like {"{firstName}"} in subject line</li>
              <li>⏱️ <strong>Wait Time:</strong> Generation takes ~2 seconds per contact</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
