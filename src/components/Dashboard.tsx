/* eslint-disable @typescript-eslint/no-explicit-any */
import Sidebar from './Sidebar'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from './toast/ToastContainer.tsx'

export default function Dashboard() {
  const { showToast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Loader message cycling
  const [loaderMessageIndex, setLoaderMessageIndex] = useState(0)
  const loaderMessages = [
    "Uploading resume...",
    "AI is extracting text...",
    "Analyzing structure and sections...",
    "Identifying skills & experience...",
    "Parsing education & certifications...",
    "Finalizing candidate profile...",
  ]

  const navigate = useNavigate()

  useEffect(() => {
    if (!uploading) return

    const interval = setInterval(() => {
      setLoaderMessageIndex(prev => (prev + 1) % loaderMessages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [uploading])

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload')
      showToast('Please select a file', 'error')
      return
    }

    setUploading(true)
    setError(null)
    setLoaderMessageIndex(0) // reset to first message

    try {
      const formData = new FormData()
      formData.append('media', file)

      const res = await fetch('http://localhost:4000/api/v1/cv-parse/generate-parse-cv', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        let errText = ''
        try {
          const errJson = await res.json()
          errText = errJson.message || errJson.error || `Status ${res.status}`
        } catch {
          errText = await res.text()
        }
        console.error(errText || `Upload failed with status ${res.status}`)
        showToast('Upload failed', 'error')
      }

      const data = await res.json()

      showToast('Resume uploaded and parsed successfully!', 'success')

      // Extract rawText — adjust path depending on actual response structure
      const rawText =
        data?.raw ||
        data?.rawText ||
        data?.data?.raw ||
        data?.text ||
        data?.content ||
        data?.parsedText ||
        ''

      if (!rawText.trim()) {
        console.warn('No rawText found in response')
        showToast('No raw text extracted from resume', 'warning')
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

      // Save full parsed data for CandidateForm page
      localStorage.setItem('last_cv_parse', JSON.stringify(data))

      // Navigate to candidate form page
      navigate('/candidate-form', {
        state: {
          parsedData: data,
        },
      })
    } catch (err: any) {
      console.error('Upload error:', err)
      const errorMsg = err.message || 'Failed to process resume'
      setError('Failed to upload and parse resume')
      console.error('Detailed error:', errorMsg)
    } finally {
      setUploading(false)
      setLoaderMessageIndex(0)
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
              {/* File input area */}
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
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

      {/* Full-page loader during parsing */}
      {uploading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl text-center max-w-lg w-full mx-4">
            <svg
              className="animate-spin h-14 w-14 mx-auto mb-6 text-indigo-600"
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

            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              {loaderMessages[loaderMessageIndex]}
            </h3>

            <p className="text-gray-600">
              Our AI is carefully analyzing the resume...
            </p>

            <div className="mt-6 text-sm text-gray-500">
              This usually takes some time
            </div>
          </div>
        </div>
      )}
    </div>
  )
}