// import { useAuth } from '../context/AuthContext'
// import { Navigate, Outlet } from 'react-router-dom'

// export default function ProtectedRoute() {
//   const { isAuthenticated, loading } = useAuth()

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-xl text-gray-600">Checking authentication...</div>
//       </div>
//     )
//   }

//   return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
// }