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

      <div className="max-w-3xl mx-auto px-6 pt-10 animate-[fadeIn_0.5s_ease-out]">
        <Link href={`/dashboard/${id}`} className="text-secondary hover:text-primary transition-colors text-sm font-medium mb-8 inline-flex items-center gap-1 group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Campaign
        </Link>

        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">Import Contacts</h1>
          <p className="text-secondary text-lg">Upload your CSV to build your audience.</p>
        </div>

        <div className="glass-card p-10">
          {/* Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`group border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 ${dragActive
              ? 'border-primary bg-blue-50/50 scale-[1.01]'
              : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50/50'
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
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300 text-white">
                📁
              </div>
              <div className="text-xl font-bold text-gray-900 mb-2">
                Drag CSV file here
              </div>
              <p className="text-secondary text-sm">
                {file ? <span className="text-primary font-medium">{file.name}</span> : 'or click to browse from your computer'}
              </p>
            </label>
          </div>

          {/* Download Template */}
          <div className="mt-6 text-center">
            <button
              onClick={downloadTemplate}
              className="text-primary hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2 px-4 py-2 rounded-full hover:bg-blue-50 transition-all"
            >
              <span>📥</span> Download CSV Template
            </button>
          </div>

          {/* Errors & Success */}
          {error && (
            <div className="mt-8 p-4 bg-red-50/80 backdrop-blur-sm text-red-700 rounded-2xl text-sm border border-red-100 flex items-center gap-3">
              <span className="text-xl">⚠️</span> {error}
            </div>
          )}

          {success && (
            <div className="mt-8 p-4 bg-green-50/80 backdrop-blur-sm text-green-700 rounded-2xl text-sm border border-green-100 flex items-center gap-3">
              <span className="text-xl">✅</span> {success}
            </div>
          )}

          {/* Preview Table */}
          {preview.length > 0 && (
            <div className="mt-10 animate-[fadeIn_0.5s_ease-out]">
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-lg font-bold text-gray-900">Preview</h2>
                <span className="text-xs font-mono text-secondary px-2 py-1 bg-gray-100 rounded-md">Showing {preview.length} rows</span>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200/60 shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/50 backdrop-blur-sm text-secondary font-semibold border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left">First Name</th>
                      <th className="px-4 py-3 text-left">Last Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Company</th>
                      <th className="px-4 py-3 text-left">Position</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 divide-y divide-gray-100">
                    {preview.map((contact, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{contact.first_name}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{contact.last_name}</td>
                        <td className="px-4 py-3 text-primary">{contact.email}</td>
                        <td className="px-4 py-3 text-secondary">{contact.company}</td>
                        <td className="px-4 py-3 text-secondary">{contact.position}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Upload Button */}
              <div className="mt-10 flex gap-4 justify-center">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn-primary w-full md:w-auto min-w-[200px]"
                >
                  {uploading ? 'Importing...' : 'Confirm Import'}
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
        </div>

        {/* Requirements Info */}
        {!preview.length && (
          <div className="mt-8 p-6 rounded-2xl border border-gray-200/50 bg-white/40 backdrop-blur-sm">
            <h3 className="font-bold text-gray-900 mb-4 text-center">CSV Formatting Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-gray-100">
                <span className="text-green-500 font-bold">✓</span>
                <span className="text-secondary">Headers in first row</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-gray-100">
                <span className="text-green-500 font-bold">✓</span>
                <span className="text-secondary">Column "email" required</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-gray-100">
                <span className="text-green-500 font-bold">✓</span>
                <span className="text-secondary">Max 10k contacts</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-gray-100">
                <span className="text-green-500 font-bold">✓</span>
                <span className="text-secondary">Size under 5MB</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <code className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 font-mono text-gray-600">
                email,first_name,last_name,company,position
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
