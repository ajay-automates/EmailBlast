import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'


interface EmailVariation {
  id: string
  variation_number: number
  subject: string
  body: string
  contact: {
    first_name: string
    last_name: string
    email: string
  }
}

export default function SendEmails() {
  const router = useRouter()
  const { id } = router.query
  const [variations, setVariations] = useState<EmailVariation[]>([])
  const [selectedVariations, setSelectedVariations] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [expandedVariation, setExpandedVariation] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchVariations()
    }
  }, [id])

  const fetchVariations = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')

      // Get contacts for this campaign
      const contactsRes = await fetch(`/api/campaigns/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (contactsRes.ok) {
        const campaign = await contactsRes.json()
        // For now, we'll fetch from a variations endpoint
        // This is a placeholder - you'd need to create this endpoint
        setVariations([]) // Will be populated once endpoint is created
      }
    } catch (error) {
      console.error('Error fetching variations:', error)
      setError('Failed to load email variations')
    } finally {
      setLoading(false)
    }
  }

  const selectAllVariations = () => {
    if (selectedVariations.size === variations.length) {
      setSelectedVariations(new Set())
    } else {
      setSelectedVariations(new Set(variations.map(v => v.id)))
    }
  }

  const toggleVariation = (id: string) => {
    const newSelected = new Set(selectedVariations)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedVariations(newSelected)
  }

  const sendEmails = async () => {
    if (selectedVariations.size === 0) {
      setError('Please select at least one email to send')
      return
    }

    try {
      setSending(true)
      setError('')
      setStatus('🚀 Sending emails...')

      const token = localStorage.getItem('auth_token')
      const res = await fetch(`/api/campaigns/${id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          variationIds: Array.from(selectedVariations),
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to send emails')
      }

      const data = await res.json()
      setStatus(`✅ ${data.message}`)

      // Redirect to analytics after 2 seconds
      setTimeout(() => {
        router.push(`/dashboard/${id}/analytics`)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Send failed')
      setStatus('')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading email variations...</div>
      </div>
    )
  }

  if (variations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-8">
          <Link href={`/dashboard/${id}`} className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Campaign
          </Link>

          <div className="card text-center">
            <div className="text-6xl mb-4">📧</div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900">No Email Variations Yet</h1>
            <p className="text-gray-600 mb-6">
              Please generate email variations first before sending.
            </p>
            <Link
              href={`/dashboard/${id}/generate`}
              className="btn-primary inline-block"
            >
              Generate Emails
            </Link>
          </div>
        </div>
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
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Send Emails</h1>
          <p className="text-gray-600 mb-8">Review and send your personalized emails</p>

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

          {/* Selection Summary */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg flex justify-between items-center">
            <div>
              <h2 className="font-bold text-gray-900 mb-1">Selected: {selectedVariations.size} / {variations.length}</h2>
              <p className="text-gray-700 text-sm">
                {selectedVariations.size > 0 ? `Ready to send ${selectedVariations.size} emails` : 'Select emails to send'}
              </p>
            </div>
            <button
              onClick={selectAllVariations}
              className="btn-secondary text-sm"
            >
              {selectedVariations.size === variations.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Email List */}
          <div className="space-y-4 mb-8">
            {variations.map((variation) => (
              <div
                key={variation.id}
                className={`border rounded-lg p-4 cursor-pointer transition ${selectedVariations.has(variation.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="flex gap-4">
                  <input
                    type="checkbox"
                    checked={selectedVariations.has(variation.id)}
                    onChange={() => toggleVariation(variation.id)}
                    className="mt-1 w-5 h-5 cursor-pointer"
                  />
                  <div className="flex-1" onClick={() => toggleVariation(variation.id)}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {variation.contact.first_name} {variation.contact.last_name}
                        </h3>
                        <p className="text-sm text-gray-600">{variation.contact.email}</p>
                      </div>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        Variation {variation.variation_number}
                      </span>
                    </div>

                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">Subject: {variation.subject}</p>
                    </div>

                    {expandedVariation === variation.id && (
                      <div className="mt-3 p-3 bg-white border border-gray-200 rounded text-sm text-gray-700">
                        <p className="whitespace-pre-wrap">{variation.body}</p>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpandedVariation(
                          expandedVariation === variation.id ? null : variation.id
                        )
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                    >
                      {expandedVariation === variation.id ? 'Hide preview' : 'Show preview'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={sendEmails}
              disabled={sending || selectedVariations.size === 0}
              className="btn-primary"
            >
              {sending ? '⏳ Sending...' : `✉️ Send ${selectedVariations.size} Emails`}
            </button>
            <button
              onClick={() => router.push(`/dashboard/${id}`)}
              disabled={sending}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>

          {/* Important Info */}
          <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">⚠️ Before Sending</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>✅ Each contact gets the email variation you selected</li>
              <li>✅ Opens and clicks will be automatically tracked</li>
              <li>✅ Reply-to address will be your verified SendGrid email</li>
              <li>✅ Cannot undo sends, so review carefully</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
