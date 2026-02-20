/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { useAuth } from '../App'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/toast/ToastContainer'
import { apiUrl } from '../api'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const navigate = useNavigate()
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic client-side validation
    if (!email.trim() || !password.trim()) {
      setFormError('Please enter both email and password')
      showToast('Both fields are required', 'error')
      return
    }

    setFormError(null)
    setLoading(true)

    try {
      const response = await fetch(apiUrl('auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      if (!response.ok) {
        let errMsg = ''
        try {
          const errData = await response.json()
          errMsg = errData.message || errData.error || `Login failed (${response.status})`
        } catch {
          errMsg = await response.text() || `Login failed (${response.status})`
        }
        throw new Error(errMsg)
      }

      const res = await response.json()

      const token = res.data?.token || ''

      if (!token) {
        showToast('No authentication token received from server', 'error')
        return
      }

      login(token)
      showToast(`Welcome back, ${res.data?.user?.name || 'User'}`, 'success')
      navigate('/dashboard')
    } catch (err: any) {
      const errorMessage = err.message || 'Something went wrong. Please try again.'
      // setFormError(errorMessage)
      showToast('Login failed', 'error')
      console.error('Login error:', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-10">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
              HR Interview System
            </h2>
            <p className="text-center text-gray-600 mb-8">
              Sign in to continue
            </p>

            {formError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-3 shadow-md
                  ${loading
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'}`}
              >
                {loading ? (
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
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <a href="/register" className="text-indigo-600 hover:underline">
                Register
              </a>
              {/* <span className="mx-3 text-gray-400">•</span>
              <a href="#" className="text-indigo-600 hover:underline">
                Contact support
              </a> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}