import './index.css'
import App from './App.tsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ToastProvider } from './components/toast/ToastContainer.tsx'
// import { AuthProvider } from './context/AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <AuthProvider> */}
      <ToastProvider>
        <App />
      </ToastProvider>
    {/* </AuthProvider> */}
  </StrictMode>,
)
