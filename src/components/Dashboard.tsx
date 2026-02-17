/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Dashboard.tsx
import { useState } from 'react'
import Sidebar from './Sidebar.tsx'
import { useAuth } from '../App.tsx'
import { useNavigate } from 'react-router-dom'
import { useToast } from './toast/ToastContainer.tsx'

export default function Dashboard() {
  const { showToast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { token } = useAuth()
  const navigate = useNavigate()

  const handleUpload = async () => {
    // if (!file || !token) {
    //   setError('Please select a file and ensure you are logged in')
    //   return
    // }

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
        showToast(`Upload failed: ${res.status} - ${errText}`, 'error')
      }

      const data = await res.json()

      // Extract rawText – adjust path based on your actual response structure
      const rawText = data?.raw || data?.rawText || data?.data?.raw || data?.text || data?.content || ''

      if (!rawText) {
        showToast('No rawText found in response', 'warning')
      }

      // Save candidate info including rawText
      const candidateEntry = {
        id: Date.now().toString(),
        filename: file.name,
        uploadedAt: new Date().toISOString(),
        rawText,
        name: data?.data?.name || data?.basics?.fullName || file.name.split('.')[0] || 'Unknown',
      }

      // Update candidates list in localStorage
      const existing = localStorage.getItem('processed_candidates') || '[]'
      const list = JSON.parse(existing)
      list.unshift(candidateEntry)
      localStorage.setItem('processed_candidates', JSON.stringify(list))

      // Optional: save full parsed data for form page
      localStorage.setItem('last_cv_parse', JSON.stringify(data))

      // Navigate to form page
      navigate('/candidate-form', {
        state: {
          parsedData: data,
        },
      })

      showToast('Resume uploaded and parsed successfully!', 'success')
    } catch (err: any) {
      console.error(err)
      showToast(err.message || 'Failed to process resume', 'error')
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
          <p className="text-gray-600 mb-8">
            Upload candidate resume to parse and extract information
          </p>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="space-y-6">
              {/* File input */}
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

              {/* Parse Resume Button with inline loader */}
              <button
                onClick={handleUpload}
                disabled={uploading || !file}
                className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-3 shadow-md
                  ${uploading || !file
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}
              >
                {uploading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Parsing Resume...
                  </>
                ) : (
                  'Parse Resume'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}