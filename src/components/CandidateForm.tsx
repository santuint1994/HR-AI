/* eslint-disable @typescript-eslint/no-explicit-any */
import Sidebar from './Sidebar'
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

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
  // Add more if needed
}

interface InterviewQuestion {
  question: string
  // Add more fields if your API returns difficulty, category, etc.
}

export default function CandidateForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState<FormData | null>(null)
  const [rawText, setRawText] = useState<string>('')
  const [generating, setGenerating] = useState(false)
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get data from navigation state (preferred)
    if (location.state?.parsedData) {
      const parsed = location.state.parsedData
      setFormData(parsed)
      // Extract rawText – adjust path based on your real response
      const text = parsed?.raw || parsed?.rawText || parsed?.data?.raw || ''
      setRawText(text)
      setLoading(false)
      return
    }

    // Fallback: last parse from localStorage
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

  const handleGenerateQuestions = async () => {
    if (!rawText.trim()) {
    setError('No raw CV text available')
    return
    }
  
    setGenerating(true)
    setError(null)
  
    try {
        const response = await fetch('http://localhost:4000/api/v1/interview/generate-interview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // If auth is needed:
            // 'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            rawText,
            requiredStack: ["Node.js", "React", "TypeScript"], // ← change / make dynamic later
          }),
        })
      
        if (!response.ok) {
          const errText = await response.text()
          throw new Error(`API error: ${response.status} - ${errText}`)
        }
      
        const result = await response.json()
      
        const generatedQuestions = Array.isArray(result)
          ? result
          : result.questions || result.data?.questions || result.interviewQuestions || []
      
        if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
          throw new Error('No questions returned from API')
        }
      
        // Save to localStorage (optional fallback)
        localStorage.setItem('last_generated_questions', JSON.stringify(generatedQuestions))
      
        // Navigate to dedicated questions page with data in state
        navigate('/interview-questions', {
          state: {
            questions: generatedQuestions,
            candidateName: formData?.basics?.fullName || 'Candidate',
          },
        })
        } catch (err: any) {
            setError(err.message || 'Failed to generate questions')
        } finally {
            setGenerating(false)
        }   
    }

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="text-xl text-gray-600">Loading parsed data...</div>
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
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Review & Generate Questions
          </h1>
          <p className="text-gray-600 mb-8">
            Review parsed candidate information and generate interview questions
          </p>

          <div className="space-y-10">
            {/* Basics */}
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.basics.fullName}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                  <input
                    type="text"
                    value={formData.basics.headline}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.basics.email}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.basics.phone}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                  <textarea
                    rows={5}
                    value={formData.basics.summary}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
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

            {/* Generate Questions Button */}
            <div className="flex justify-end pt-6">
              <button
                type="button"
                onClick={handleGenerateQuestions}
                disabled={generating || !rawText.trim()}
                className={`px-8 py-3 font-medium rounded-lg transition shadow-md
                  ${generating || !rawText.trim()
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              >
                {generating ? 'Generating Questions...' : 'Generate Questions'}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Generated Questions */}
            {questions.length > 0 && (
              <section className="mt-10 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-2xl font-semibold mb-6 text-green-700">
                  Generated Interview Questions
                </h2>
                <div className="space-y-5">
                  {questions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <p className="font-medium text-gray-800">
                        Q{idx + 1}: {q.question}
                      </p>
                      {/* Add difficulty, category, etc. if available */}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}