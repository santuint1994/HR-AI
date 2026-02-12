/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App.tsx'
import Sidebar from './Sidebar.tsx'

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { token } = useAuth()
  // const navigate = useNavigate()

  const handleUpload = async () => {
    if (!file || !token) {
      setError('Please select a file and ensure you are logged in')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('media', file)

      const res = await fetch('http://localhost:4000/api/v1/cv-parse/create-parse-cv', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Upload failed: ${res.status} - ${errText}`)
      }

      const data = await res.json()
      console.log('CV Parse Response:', data)

      // Extract rawText – adjust this path according to your actual response structure
      const rawText = data?.rawText || ''

      if (!rawText) {
        console.warn('No rawText found in response')
      }

      // Save candidate info including rawText
      const candidateEntry = {
        id: Date.now().toString(),
        filename: file.name,
        uploadedAt: new Date().toISOString(),
        rawText,                      // ← saved for later interview generation
        name: data?.data?.name || file.name.split('.')[0] || 'Unknown',
        // you can save more fields if needed: email, skills, etc.
      }

      // Update candidates list in localStorage
      const existing = localStorage.getItem('processed_candidates') || '[]'
      const list = JSON.parse(existing)
      list.unshift(candidateEntry)
      localStorage.setItem('processed_candidates', JSON.stringify(list))

      alert('Resume parsed successfully!')
      // Optional: navigate('/candidates') or show success message

    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to process resume')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Resume</h1>
          <p className="text-gray-600 mb-8">Upload candidate resume to parse and extract information</p>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  id="resume-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <div className="text-blue-600 mb-3">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-700">
                    {file ? file.name : 'Click or drag & drop resume'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">PDF, DOC, DOCX</p>
                </label>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-center">
                  {error}
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className={`w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium
                  hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md
                  ${(!file || uploading) ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {uploading ? 'Processing...' : 'Parse Resume'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}