import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App.tsx'

export default function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col">
    <div className="p-6 border-b border-gray-100 flex items-center gap-4">
      <img
        src="/int25yearslogo.png"
        alt="INT"
        className="h-12 w-auto object-contain"
      />
      <h2 className="text-xl font-bold text-gray-900">
        HR Dashboard
      </h2>
    </div>

      <div className="flex-1 p-4">
        <div className="space-y-1">
          <div className="px-3 py-3 text-gray-700 font-medium">Manage Candidates</div>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full text-left px-6 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3 text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Candidate
          </button>

          <button
            onClick={() => navigate('/candidates')}
            className="w-full text-left px-6 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3 text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View Candidates
          </button>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="w-full py-3 px-4 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  )
}