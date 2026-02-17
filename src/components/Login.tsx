/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App.tsx'
import { useToast } from '../components/toast/ToastContainer'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic client-side check
    if (!username.trim() || !password.trim()) {
      setFormError('Please fill in both username and password')
      return
    }

    setFormError(null)
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:4000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        showToast(`Login failed: ${response.status} - ${errorData.message || response.statusText}`, 'error')
      }

      const data = await response.json()

      // Assuming your API returns something like:
      // { token: "jwt...", user: { ... } }
      const token = data.token || data.accessToken

      if (!token) {
        showToast('No token received', 'warning')
      }

      // Save token using your auth context
      login(token)

      showToast('Login successful!', 'success')

      // Redirect to dashboard
      navigate('/dashboard')
    } catch (err: any) {
      const errorMessage = err.message || 'Something went wrong. Please try again.'
      showToast(errorMessage, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-3xl font-semibold text-center text-gray-800 mb-2">
              HR Interview System
            </h2>
            <p className="text-center text-gray-500 mb-8">Sign in to continue</p>

            {formError && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <input
                  type="text"
                  placeholder="Username/Email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-60"
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2
                  ${isLoading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isLoading ? (
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
          </div>
        </div>
      </div>
    </div>
  )
}