/* eslint-disable @typescript-eslint/no-explicit-any */
import Sidebar from './Sidebar'
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { useToast } from './toast/ToastContainer' // adjust path if needed
import { apiUrl } from '../api'

interface FormData {
  basics: {
    fullName: string
    headline: string
    email: string
    phone: string
    location: string | null
    summary: string
  }
  skills: string[]
  languages: string[]
  certifications: Array<{ name: string; issuer: string | null; date: string | null }>
  education: Array<{
    institution: string
    degree: string
    field: string | null
    startDate: string
    endDate: string
    details: string
  }>
  experience: Array<{
    company: string
    title: string
    location: string
    startDate: string
    endDate: string
    highlights: string[]
  }>
  projects: Array<{
    name: string
    description: string
    highlights: string[]
  }>
}

export default function CandidateForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()

  const [formData, setFormData] = useState<FormData | null>(null)
  const [rawText, setRawText] = useState<string>('')
  const [resumeId, setResumeId] = useState<string>('')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [candidateSaved, setCandidateSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  // View/Edit mode from Candidates page
  const [isViewMode, setIsViewMode] = useState(false)

  // Modal state for requiredTech
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [requiredTech, setRequiredTech] = useState<string>('Node.js, React, TypeScript')
  const [techError, setTechError] = useState<string | null>(null)

  // Validation for email & phone
  const [emailError, setEmailError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)

  useEffect(() => {
    const state = location.state

    // Case 1: Coming from Candidates page "View" button
    if (state?.candidateData) {
      const candidate = state.candidateData
      setIsViewMode(true)
      setResumeId(candidate.id || '')

      setFormData({
        basics: {
          fullName: candidate.basics?.fullName || '',
          headline: candidate.basics?.headline || '',
          email: candidate.basics?.email || '',
          phone: candidate.basics?.phone || '',
          location: candidate.basics?.location || null,
          summary: candidate.basics?.summary || '',
        },
        skills: candidate.skills?.map((s: any) => s) || [],
        languages: candidate.languages || [],
        certifications: candidate.certifications || [],
        education: candidate.education || [],
        experience: candidate.experience || [],
        projects: candidate.projects || [],
      })

      setRawText(candidate.rawText || candidate.raw || '')
      setLoading(false)
      return
    }

    // Case 2: Coming from upload/parse (original flow)
    if (state?.parsedData) {
      const parsed = state.parsedData
      setFormData(parsed)
      const text = parsed?.raw || parsed?.rawText || parsed?.data?.raw || ''
      setRawText(text)
      setLoading(false)
      return
    }

    const lastParse = localStorage.getItem('last_cv_parse')
    if (lastParse) {
      try {
        const parsed = JSON.parse(lastParse)
        setFormData(parsed)
        const text = parsed?.raw || parsed?.rawText || parsed?.data?.raw || ''
        setRawText(text)
        setLoading(false)
      } catch (e) {
        setError(`Failed to load parsed resume data: ${(e as Error).message}`)
        setLoading(false)
      }
    } else {
      setError('No parsed resume data found. Please upload a resume first.')
      setLoading(false)
    }
  }, [location.state])

  // Validation helpers
  const validateEmail = (value: string): string | null => {
    if (!value.trim()) return 'Email is required'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) ? null : 'Please enter a valid email address'
  }

  const validatePhone = (value: string): string | null => {
    if (!value.trim()) return 'Phone number is required'
    const cleaned = value.replace(/\s+/g, '').replace(/\+91/, '').replace(/-/g, '')
    const phoneRegex = /^[6-9]\d{9}$/
    return phoneRegex.test(cleaned) ? null : 'Please enter a valid 10-digit Indian phone number'
  }

  const handleChange = (
    section: keyof FormData,
    key: string,
    value: string | any
  ) => {
    // No longer blocking changes — allow editing even in view mode
    setFormData(prev => {
      if (!prev) return prev
      const newData = { ...prev }

      if (section === 'basics') {
        newData.basics = {
          ...newData.basics,
          [key]: value,
        }

        if (key === 'email') setEmailError(validateEmail(value))
        if (key === 'phone') setPhoneError(validatePhone(value))
      }

      return newData
    })
  }

  useEffect(() => {
    if (formData?.basics) {
      setEmailError(validateEmail(formData.basics.email || ''))
      setPhoneError(validatePhone(formData.basics.phone || ''))
    }
  }, [formData])

  const handleSaveCandidate = async () => {
    if (!formData) return

    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch(apiUrl('cv-parse/create-parse-cv'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          rawText,
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || errData.error || 'Failed to save candidate')
      }

      const saved = await response.json()
      console.log('Candidate saved:', saved)

      const newResumeId = saved?.data?.id || ''
      if (newResumeId) {
        setResumeId(newResumeId)
      } else {
        console.warn('No resumeId returned from save candidate API')
      }

      setSuccessMessage('Candidate saved successfully!')
      setCandidateSaved(true)
      showToast('Candidate profile saved/updated!', 'success')
    } catch (err: any) {
      const errMsg = err.message || 'Failed to save candidate'
      setError(errMsg)
      showToast(errMsg, 'error')
    } finally {
      setSaving(false)
    }
  }

  const openGenerateModal = () => {
    if (!rawText.trim()) {
      setError('No raw CV text available')
      showToast('No raw CV text available', 'error')
      return
    }
    if (!resumeId) {
      setError('No resume ID available. Please save candidate first.')
      showToast('Please save candidate first', 'error')
      return
    }
    setTechError(null)
    setIsModalOpen(true)
  }

  const confirmAndGenerate = async () => {
    const tech = requiredTech.trim()

    if (!tech) {
      setTechError('Please enter at least one technology')
      return
    }

    setGenerating(true)
    setError(null)
    setIsModalOpen(false)

    try {
      const response = await fetch(apiUrl('interview/generate-interview'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId,
          requiredTech: tech,
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        console.error(`API error: ${response.status} - ${errText}`)
        showToast('Interview question generation failed', 'error')
      }

      const result = await response.json()

      const generatedQuestions = Array.isArray(result)
        ? result
        : result.data?.interviewQuestions || []

      if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
        showToast('No questions returned from API', 'error')
      }

      localStorage.setItem('last_generated_questions', JSON.stringify(generatedQuestions))

      navigate('/interview-questions', {
        state: {
          questions: generatedQuestions,
          candidateName: formData?.basics?.fullName || 'Candidate',
        },
      })

      showToast('Interview questions generated successfully!', 'success')
    } catch (err: any) {
      const errMsg = err.message || 'Failed to generate questions'
      showToast('Interview question generation failed', 'error')
      console.error('Generation error:', errMsg)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full mx-4">
          <svg
            className="animate-spin h-12 w-12 mx-auto mb-6 text-indigo-600"
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
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Loading Candidate Data
          </h3>
          <p className="text-gray-600">
            Please wait while we prepare the form...
          </p>
        </div>
      </div>
    )
  }

  if (error || !formData) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">{error || 'No data available'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Upload a Resume
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {isViewMode ? 'View / Edit Candidate' : 'Review Candidate Information'}
              </h1>
              <p className="text-gray-600">
                {isViewMode
                  ? 'View or edit saved candidate details'
                  : 'Review parsed data and save before generating interview questions'}
              </p>
            </div>

            {isViewMode && (
              <button
                onClick={() => navigate('/candidates')}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Back to Candidates
              </button>
            )}
          </div>

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}

          <div className="space-y-10">
            {/* Basic Information */}
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.basics.fullName}
                    onChange={(e) => handleChange('basics', 'fullName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                  <input
                    type="text"
                    value={formData.basics.headline}
                    onChange={(e) => handleChange('basics', 'headline', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.basics.email}
                    onChange={(e) => handleChange('basics', 'email', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg bg-gray-50 transition-all focus:outline-none focus:ring-2 ${
                      emailError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.basics.phone}
                    onChange={(e) => handleChange('basics', 'phone', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg bg-gray-50 transition-all focus:outline-none focus:ring-2 ${
                      phoneError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {phoneError && <p className="mt-1 text-sm text-red-600">{phoneError}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                  <textarea
                    rows={5}
                    value={formData.basics.summary}
                    onChange={(e) => handleChange('basics', 'summary', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            </section>

            {/* Skills */}
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {/* Experience */}
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Experience</h2>
              {formData.experience.length === 0 ? (
                <p className="text-gray-500">No experience data parsed</p>
              ) : (
                formData.experience.map((exp, idx) => (
                  <div key={idx} className="mb-6 border-b pb-4 last:border-b-0">
                    <p className="font-medium">{exp.company} • {exp.title}</p>
                    <p className="text-sm text-gray-500">
                      {exp.startDate} – {exp.endDate || 'Present'} • {exp.location}
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                      {exp.highlights.map((h, hIdx) => (
                        <li key={hIdx}>{h}</li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </section>

            {/* Projects */}
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Projects</h2>
              {formData.projects.length === 0 ? (
                <p className="text-gray-500">No projects data parsed</p>
              ) : (
                formData.projects.map((proj, idx) => (
                  <div key={idx} className="mb-6 border-b pb-4 last:border-b-0">
                    <p className="font-medium">{proj.name}</p>
                    <p className="text-gray-700 mt-1">{proj.description}</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                      {proj.highlights.map((h, hIdx) => (
                        <li key={hIdx}>{h}</li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </section>

            {/* Action Buttons */}
            <div className="flex justify-end pt-6 gap-4">
              {!candidateSaved && !isViewMode && (
                <button
                  type="button"
                  onClick={handleSaveCandidate}
                  disabled={saving || !!emailError || !!phoneError}
                  className={`px-8 py-3 font-medium rounded-lg transition shadow-md flex items-center gap-2 ${
                    saving || !!emailError || !!phoneError
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {saving ? (
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
                      Saving Candidate...
                    </>
                  ) : (
                    'Save Candidate'
                  )}
                </button>
              )}

              {candidateSaved && (
                <button
                  type="button"
                  onClick={openGenerateModal}
                  disabled={generating || !rawText.trim() || !!emailError || !!phoneError}
                  className={`px-8 py-3 font-medium rounded-lg transition shadow-md flex items-center gap-2 ${
                    generating || !rawText.trim() || !!emailError || !!phoneError
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {generating ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    'Generate Interview Questions'
                  )}
                </button>
              )}
            </div>

            {/* General error */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-page loading overlay during generation */}
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
                      Enter the technologies/languages you want the interview questions to focus on (comma separated):
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
                      Tip: You can enter one or many (e.g. Node.js, React, GraphQL)
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
    </div>
  )
}