import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'


interface PreviewContact {
  first_name: string
  last_name: string
  email: string
  company: string
  position: string
}

export default function UploadContacts() {
  const router = useRouter()
  const { id } = router.query
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewContact[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const parseCSV = (text: string): PreviewContact[] => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header and one data row')
    }

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim())
    const contacts: PreviewContact[] = []

    // Find column indices
    const getIndex = (name: string) =>
      headers.findIndex(h => h.includes(name.toLowerCase()))

    const firstNameIdx = getIndex('first_name') >= 0 ? getIndex('first_name') : getIndex('firstname')
    const lastNameIdx = getIndex('last_name') >= 0 ? getIndex('last_name') : getIndex('lastname')
    const emailIdx = getIndex('email')
    const companyIdx = getIndex('company')
    const positionIdx = getIndex('position') >= 0 ? getIndex('position') : getIndex('title')

    if (emailIdx < 0) {
      throw new Error('CSV must contain an "email" column')
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      if (values.length > 1) {
        contacts.push({
          first_name: firstNameIdx >= 0 ? values[firstNameIdx] : '',
          last_name: lastNameIdx >= 0 ? values[lastNameIdx] : '',
          email: values[emailIdx] || '',
          company: companyIdx >= 0 ? values[companyIdx] : '',
          position: positionIdx >= 0 ? values[positionIdx] : '',
        })
      }
    }

    return contacts
  }

  const handleFile = (selectedFile: File) => {
    setError('')
    setSuccess('')

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }

    setFile(selectedFile)
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const contacts = parseCSV(text)
        setPreview(contacts.slice(0, 10)) // Show first 10

        if (contacts.length > 10) {
          setSuccess(`Parsed ${contacts.length} contacts. Showing first 10 preview.`)
        } else {
          setSuccess(`Ready to import ${contacts.length} contacts`)
        }
      } catch (err: any) {
        setError(err.message)
        setFile(null)
        setPreview([])
      }
    }

    reader.readAsText(selectedFile)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file || preview.length === 0) {
      setError('Please select a CSV file first')
      return
    }

    try {
      setUploading(true)
      setError('')

      const text = await file.text()
      const base64 = Buffer.from(text).toString('base64')

      const token = localStorage.getItem('auth_token')
      const res = await fetch(`/api/campaigns/${id}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ csvData: base64 }),
      })

      if (!res.ok) {
        throw new Error('Failed to upload contacts')
      }

      const data = await res.json()
      setSuccess(`Successfully imported ${data.imported} contacts!`)

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/dashboard/${id}`)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    const template = 'first_name,last_name,email,company,position\nJohn,Doe,john@example.com,Acme Inc,Software Engineer\nJane,Smith,jane@example.com,Tech Corp,Product Manager'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contacts_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <Link href={`/dashboard/${id}`} className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Campaign
        </Link>

        <div className="card">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Import Contacts</h1>
          <p className="text-gray-600 mb-8">Upload a CSV file with your contact list</p>

          {/* Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
              }`}
          >
            <input
              type="file"
              accept=".csv"
              onChange={(e) => e.target.files && handleFile(e.target.files[0])}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="block cursor-pointer">
              <div className="text-4xl mb-2">📁</div>
              <div className="text-lg font-semibold text-gray-900 mb-1">
                Drag CSV file here or click to browse
              </div>
              <p className="text-gray-500 text-sm">
                {file ? `Selected: ${file.name}` : 'CSV format with headers: first_name, last_name, email, company, position'}
              </p>
            </label>
          </div>

          {/* Download Template */}
          <div className="mt-4 text-center">
            <button
              onClick={downloadTemplate}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              📥 Download CSV Template
            </button>
          </div>

          {/* Errors & Success */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
              ✅ {success}
            </div>
          )}

          {/* Preview Table */}
          {preview.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold mb-4 text-gray-900">Preview ({preview.length} of {preview.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">First Name</th>
                      <th className="px-4 py-2 text-left">Last Name</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Company</th>
                      <th className="px-4 py-2 text-left">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((contact, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{contact.first_name}</td>
                        <td className="px-4 py-2">{contact.last_name}</td>
                        <td className="px-4 py-2 text-blue-600 text-xs">{contact.email}</td>
                        <td className="px-4 py-2 text-sm">{contact.company}</td>
                        <td className="px-4 py-2 text-sm">{contact.position}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Upload Button */}
              <div className="mt-8 flex gap-4">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn-primary"
                >
                  {uploading ? 'Uploading...' : '✅ Import All Contacts'}
                </button>
                <button
                  onClick={() => {
                    setFile(null)
                    setPreview([])
                    setSuccess('')
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Requirements Info */}
          <div className="mt-12 p-6 bg-blue-50 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-3">📋 CSV Requirements</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>✅ Must have headers in first row</li>
              <li>✅ Required column: <code className="bg-white px-2 py-1 rounded">email</code></li>
              <li>✅ Optional columns: <code className="bg-white px-2 py-1 rounded">first_name, last_name, company, position</code></li>
              <li>✅ Max 10,000 contacts per upload</li>
              <li>✅ File size under 5MB</li>
              <li>📝 Example: <code className="text-xs bg-white px-2 py-1 rounded block mt-2">john@example.com,John,Doe,Acme Inc,Engineer</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
