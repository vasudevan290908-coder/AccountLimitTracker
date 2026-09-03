import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import ConfigPage from './components/ConfigPage'
import { isSupabaseConfigured } from './lib/supabase'

export default function App() {
  const { user, loading } = useAuth()

  if (!isSupabaseConfigured) {
    return <ConfigPage />
  }

  // Full-screen spinner while we resolve the existing session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <span className="w-8 h-8 rounded-full border-2 border-gray-700 border-t-sky-500 animate-spin" />
      </div>
    )
  }

  return (
    <>
      {user ? <Dashboard user={user} /> : <LoginPage />}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1f2937',  // gray-800
            color: '#f9fafb',       // gray-50
            border: '1px solid #374151', // gray-700
            borderRadius: '10px',
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#1f2937' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#1f2937' },
          },
        }}
      />
    </>
  )
}
