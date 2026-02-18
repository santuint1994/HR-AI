// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
// import { useNavigate } from 'react-router-dom'

// interface AuthContextType {
//   isAuthenticated: boolean
//   user: any | null          // adjust based on your user shape
//   token: string | null
//   login: (token: string, userData?: any) => void
//   logout: () => void
//   loading: boolean
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined)

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [isAuthenticated, setIsAuthenticated] = useState(false)
//   const [user, setUser] = useState<any | null>(null)
//   const [token, setToken] = useState<string | null>(null)
//   const [loading, setLoading] = useState(true)

//   const navigate = useNavigate()

//   // Check token on mount / reload
//   useEffect(() => {
//     const checkAuth = async () => {
//       setLoading(true)

//       const storedToken = localStorage.getItem('token')

//       if (!storedToken) {
//         setIsAuthenticated(false)
//         setLoading(false)
//         return
//       }

//       try {
//         const res = await fetch('http://localhost:4000/api/v1/auth/me', {
//           headers: {
//             Authorization: `Bearer ${storedToken}`,
//           },
//         })

//         if (!res.ok) {
//           throw new Error('Token invalid or expired')
//         }

//         const data = await res.json()
//         setToken(storedToken)
//         setUser(data.user || data) // adjust based on your response
//         setIsAuthenticated(true)

//         // Optional: refresh token or update user info
//       } catch (err) {
//         console.error('Auth check failed:', err)
//         localStorage.removeItem('token')
//         setIsAuthenticated(false)
//         setUser(null)
//         setToken(null)
//         navigate('/login')
//       } finally {
//         setLoading(false)
//       }
//     }

//     checkAuth()
//   }, [navigate])

//   const login = (newToken: string, userData?: any) => {
//     localStorage.setItem('token', newToken)
//     setToken(newToken)
//     setUser(userData || null)
//     setIsAuthenticated(true)
//   }

//   const logout = () => {
//     localStorage.removeItem('token')
//     setToken(null)
//     setUser(null)
//     setIsAuthenticated(false)
//     navigate('/login')
//   }

//   return (
//     <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export const useAuth = () => {
//   const context = useContext(AuthContext)
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider')
//   }
//   return context
// }