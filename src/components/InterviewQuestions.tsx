// src/components/InterviewQuestions.tsx
import { useEffect, useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'

interface InterviewQuestion {
  question: string
  expectedAnswer: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
}

type SortOption = 'difficulty-asc' | 'difficulty-desc' | 'none'
type FilterCategory = string | 'all'
type FilterDifficulty = 'easy' | 'medium' | 'hard' | 'all'

const ITEMS_PER_PAGE = 5

export default function InterviewQuestions() {
  const location = useLocation()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [candidateName, setCandidateName] = useState<string>('Candidate')

  const [sortBy, setSortBy] = useState<SortOption>('none')
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<FilterDifficulty>('all')

  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    let loadedQuestions: InterviewQuestion[] = []

    if (location.state?.questions && Array.isArray(location.state.questions)) {
      loadedQuestions = location.state.questions
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCandidateName(location.state.candidateName || 'Candidate')
    } else {
      const last = localStorage.getItem('last_generated_questions')
      if (last) {
        try {
          const parsed = JSON.parse(last)
          loadedQuestions = Array.isArray(parsed) ? parsed : []
        } catch (e) {
          console.error('Failed to parse last generated questions:', e)
        }
      }
    }

    setQuestions(loadedQuestions)
    setCurrentPage(1) // reset to first page when new questions arrive
  }, [location.state])

  const categories = useMemo(() => {
    const cats = new Set(questions.map(q => q.category))
    return ['all', ...Array.from(cats)]
  }, [questions])

  const filteredAndSortedQuestions = useMemo(() => {
    let result = [...questions]

    // Filter category
    if (filterCategory !== 'all') {
      result = result.filter(q => q.category === filterCategory)
    }

    // Filter difficulty
    if (filterDifficulty !== 'all') {
      result = result.filter(q => q.difficulty === filterDifficulty)
    }

    // Sort
    if (sortBy === 'difficulty-asc') {
      const order = { easy: 1, medium: 2, hard: 3 }
      result.sort((a, b) => order[a.difficulty] - order[b.difficulty])
    } else if (sortBy === 'difficulty-desc') {
      const order = { easy: 1, medium: 2, hard: 3 }
      result.sort((a, b) => order[b.difficulty] - order[a.difficulty])
    }

    return result
  }, [questions, filterCategory, filterDifficulty, sortBy])

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedQuestions.length / ITEMS_PER_PAGE)
  const currentQuestions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return filteredAndSortedQuestions.slice(start, end)
  }, [filteredAndSortedQuestions, currentPage])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleResetFilters = () => {
    setFilterCategory('all')
    setFilterDifficulty('all')
    setSortBy('none')
    setCurrentPage(1)
  }

  if (questions.length === 0) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            No interview questions available
          </h2>
          <p className="text-gray-600 mb-8">
            Generate questions from the candidate review page first.
          </p>
          <button
            onClick={() => navigate('/candidate-form')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Go to Candidate Review
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header + Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Interview Questions
              </h1>
              <p className="text-gray-600 mt-1">
                For {candidateName} • {filteredAndSortedQuestions.length} questions
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="none">Sort by...</option>
                <option value="difficulty-asc">Difficulty: Easy → Hard</option>
                <option value="difficulty-desc">Difficulty: Hard → Easy</option>
              </select>

              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>

              <select
                value={filterDifficulty}
                onChange={e => setFilterDifficulty(e.target.value as FilterDifficulty)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Questions List */}
          {currentQuestions.length === 0 ? (
            <div className="bg-white p-10 rounded-xl border border-gray-200 text-center">
              <p className="text-xl text-gray-600 mb-4">
                No questions match the selected filters
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {currentQuestions.map((q, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  <div className="p-5 md:p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl">
                          {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            q.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                            q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {q.difficulty.toUpperCase()}
                          </span>
                          <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">
                            {q.category}
                          </span>
                        </div>

                        <p className="text-lg font-medium text-gray-900 mb-4 leading-relaxed">
                          {q.question}
                        </p>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Expected / Model Answer:
                          </p>
                          <p className="text-gray-600 whitespace-pre-line">
                            {q.expectedAnswer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedQuestions.length)} of{' '}
                {filteredAndSortedQuestions.length}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg border ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  // Show first 2, last 2, and current ±1 with ellipsis
                  if (
                    page === 1 ||
                    page === totalPages ||
                    page === currentPage ||
                    page === currentPage - 1 ||
                    page === currentPage + 1
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-4 py-2 rounded-lg border ${
                          page === currentPage
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  }

                  if (
                    (page === 2 && currentPage > 3) ||
                    (page === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    return <span key={page} className="px-2 py-2">...</span>
                  }

                  return null
                })}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg border ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          <div className="mt-12 flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/candidate-form')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Back to Candidate Review
            </button>
            <button
              onClick={() => navigate('/candidates')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Back to Candidates List
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}