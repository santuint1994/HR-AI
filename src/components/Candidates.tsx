/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar.tsx'
import { sampleCandidates } from './data/sample-candidates'

interface Candidate {
  id: string
  filename: string
  uploadedAt: string
  rawText: string
  name?: string
}

export default function Candidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const navigate = useNavigate()

  // useEffect(() => {
  //   const stored = localStorage.getItem('processed_candidates')
  //   if (stored) {
  //     try {
  //       setCandidates(JSON.parse(stored))
  //     } catch (e) {
  //       console.error('Failed to parse candidates', e)
  //     }
  //   }
  // }, [])

  useEffect(() => {
    const stored = localStorage.getItem('processed_candidates')

    if (!stored || JSON.parse(stored).length === 0) {
      // Seed with sample data if empty
      localStorage.setItem('processed_candidates', JSON.stringify(sampleCandidates))
      setCandidates(sampleCandidates)
    } else {
      try {
        setCandidates(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse candidates', e)
        // Fallback to samples if corrupted
        localStorage.setItem('processed_candidates', JSON.stringify(sampleCandidates))
        setCandidates(sampleCandidates)
      }
    }
  }, [])

  const handleGenerateInterview = async (candidate: Candidate) => {
    if (!candidate.rawText.trim()) {
      alert('No raw CV text available for this candidate')
      return
    }

    const stackInput = prompt(
      'Enter required technologies (comma separated):',
      'Node.js, React, TypeScript'
    )

    if (!stackInput) return

    const requiredStack = stackInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    if (requiredStack.length === 0) {
      alert('Please enter at least one technology')
      return
    }

    setLoadingId(candidate.id)

    try {
      const response = await fetch('http://localhost:4000/api/v1/interview/generate-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // If authentication is required:
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          rawText: candidate.rawText,
          requiredStack,
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`Failed: ${response.status} - ${errText}`)
      }

      const result = await response.json()
      console.log('Interview questions generated:', result)

      // Show result (you can improve this with modal or new page)
      alert('Interview questions generated!\n\n' + JSON.stringify(result, null, 2))

      // Optional: save result somewhere
      // localStorage.setItem(`interview_${candidate.id}`, JSON.stringify(result))

    } catch (err: any) {
      console.error(err)
      alert('Error generating interview questions:\n' + err.message)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Processed Candidates</h1>
          <p className="text-gray-600 mb-8">List of candidates whose CVs have been processed</p>

          {candidates.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No candidates processed yet</h3>
              <p className="mt-1 text-gray-500">Upload a CV on the dashboard to start.</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Go to Upload
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Filename</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Processed</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {candidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {candidate.filename}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {candidate.name || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(candidate.uploadedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button
                          onClick={() => handleGenerateInterview(candidate)}
                          disabled={loadingId === candidate.id}
                          className={`text-indigo-600 hover:text-indigo-900 font-medium ${
                            loadingId === candidate.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {loadingId === candidate.id ? 'Generating...' : 'Generate Interview'}
                        </button>
                      </td>
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