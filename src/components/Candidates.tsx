/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar.tsx'
import { useToast } from './toast/ToastContainer.tsx'
import { Transition, Dialog } from '@headlessui/react'
import { Fragment } from 'react'
import { apiUrl } from '../api.ts'

interface Candidate {
  id: string
  createdAt: string
  totalExperience: number
  basics: {
    fullName: string
    email: string
    phone: string
  }
  skills: Array<{ name: string }>
}

export default function Candidates() {
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [viewCandidateLoading, setViewCandidateLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pagination & search
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // Modal state for requiredTech
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [requiredTech, setRequiredTech] = useState<string>('Node.js, React, TypeScript')
  const [techError, setTechError] = useState<string | null>(null)

  // Loader state for question generation
  const [generating, setGenerating] = useState(false)

  // Debounce search term (wait 500ms after typing stops)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setPage(1) // Reset to page 1 on search change
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm])

  const fetchCandidates = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (debouncedSearchTerm.trim()) {
        params.append('search', debouncedSearchTerm.trim())
      }

      const url = apiUrl(`candidate/search?${params.toString()}`)

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Failed to fetch candidates: ${res.status} - ${errText}`)
      }

      const result = await res.json()
      const candidateList = result.resumes || result.data?.resumes || []
      const pagination = result.pagination || {}

      setCandidates(candidateList)
      setTotalPages(pagination.totalPages || 1)

      if (candidateList.length === 0) {
        showToast('No candidates found', 'info')
      }
    } catch (err: any) {
      const errMsg = err.message || 'Failed to load candidates'
      setError(errMsg)
      showToast(errMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [page, debouncedSearchTerm])

  // Function: View candidate details with loader
  const handleViewCandidate = async (candidateId: string) => {
    setViewCandidateLoading(true)
    try {
      const res = await fetch(apiUrl(`candidate/${candidateId}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Failed to fetch candidate: ${res.status} - ${errText}`)
      }

      const candidateData = await res.json()

      // Navigate to candidate form with fetched data
      navigate('/candidate-form', {
        state: {
          candidateData,
          isViewMode: true,
        },
      })
    } catch (err: any) {
      showToast(err.message || 'Error loading candidate details', 'error')
    } finally {
      setViewCandidateLoading(false)
    }
  }

  const openTechModal = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setRequiredTech('Node.js, React, TypeScript')
    setTechError(null)
    setIsModalOpen(true)
  }

  const confirmAndGenerate = async () => {
    const tech = requiredTech.trim()

    if (!tech) {
      setTechError('Please enter at least one technology')
      return
    }

    if (!selectedCandidate) return

    setGenerating(true)
    setIsModalOpen(false)

    try {
      const res = await fetch(apiUrl('interview/generate-interview'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId: selectedCandidate.id,
          requiredTech: tech,
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        console.error(`Failed to generate questions: ${res.status} - ${errText}`)
        showToast('Failed to generate interview questions', 'error')
        return
      }

      const result = await res.json()

      showToast('Interview questions generated successfully!', 'success')

      navigate('/interview-questions', {
        state: {
          questions: result.data?.interviewQuestions || result.questions || result || [],
          candidateName: selectedCandidate.basics.fullName || 'Candidate',
        },
      })
    } catch (err: any) {
      console.error('Error generating interview questions:', err.message)
      showToast('Error generating interview questions', 'error')
    } finally {
      setGenerating(false)
      setSelectedCandidate(null)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  return (
    <div className="relative flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-gray-800">Candidates</h1>

            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
              <button
                onClick={() => {
                  setSearchTerm('')
                  setPage(1)
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Clear
              </button>
            </div>
          </div>

          {loading ? (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full mx-4">
                <svg
                  className="animate-spin h-12 w-12 mx-auto mb-6 text-indigo-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Loading Candidates
                </h3>
                <p className="text-gray-600">
                  Fetching candidate list, please wait...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center">
              {error}
              <button
                onClick={fetchCandidates}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          ) : candidates.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No candidates found</h3>
              <p className="mt-1 text-gray-500">
                Upload resumes on the dashboard to get started.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Go to Upload
              </button>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Candidate Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Experience (years)
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Total Skills
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Added On
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {candidates.map((candidate) => (
                      <tr key={candidate.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {candidate.basics.fullName || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {candidate.basics.email || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {candidate.basics.phone || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {candidate.totalExperience || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {candidate.skills?.length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(candidate.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                          <button
                            onClick={() => handleViewCandidate(candidate.id)}
                            disabled={viewCandidateLoading}
                            className={`text-blue-600 hover:text-blue-800 font-medium ${viewCandidateLoading ? 'opacity-50 cursor-wait' : ''}`}
                          >
                            {viewCandidateLoading ? 'Loading...' : 'View'}
                          </button>
                          <button
                            onClick={() => openTechModal(candidate)}
                            className="text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            Generate Interview
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center items-center gap-4">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={`px-5 py-2 rounded-lg border font-medium ${
                      page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>

                  <span className="text-gray-700 font-medium px-4">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className={`px-5 py-2 rounded-lg border font-medium ${
                      page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Full-page loader while fetching single candidate (View button) */}
      {viewCandidateLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full mx-4">
            <svg
              className="animate-spin h-12 w-12 mx-auto mb-6 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Loading Candidate Details
            </h3>
            <p className="text-gray-600">
              Fetching candidate information, please wait...
            </p>
          </div>
        </div>
      )}

      {/* Modal for requiredTech */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 md:p-8 text-left align-middle shadow-2xl transition-all">
                  <Dialog.Title as="h3" className="text-2xl font-semibold leading-6 text-gray-900 mb-6">
                    Required Technologies
                  </Dialog.Title>

                  <div className="mt-2 space-y-4">
                    <p className="text-gray-600">
                      Enter the technology stack you want the interview questions to focus on (comma separated):
                    </p>

                    <textarea
                      value={requiredTech}
                      onChange={(e) => {
                        setRequiredTech(e.target.value)
                        setTechError(null)
                      }}
                      placeholder="Node.js, React, TypeScript, AWS, Docker, PostgreSQL, ..."
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent resize-none ${
                        techError
                          ? 'border-red-500 focus:ring-red-200'
                          : 'border-gray-300 focus:ring-indigo-500'
                      }`}
                    />

                    {techError && (
                      <p className="text-sm text-red-600">{techError}</p>
                    )}

                    <p className="text-xs text-gray-500">
                      Example: Node.js, React, GraphQL, AWS
                    </p>
                  </div>

                  <div className="mt-8 flex justify-end gap-4">
                    <button
                      type="button"
                      className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={generating}
                      onClick={confirmAndGenerate}
                      className={`px-6 py-2.5 rounded-lg text-white transition ${
                        generating
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {generating ? 'Generating...' : 'Generate Interview Questions'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Full-page loader during question generation */}
      {generating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full mx-4">
            <svg
              className="animate-spin h-12 w-12 mx-auto mb-6 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Generating Interview Questions
            </h3>
            <p className="text-gray-600">
              This may take a few seconds. Please wait...
            </p>
          </div>
        </div>
      )}
    </div>
  )
}