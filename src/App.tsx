import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { AppLayout } from './components/AppLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import HoldingsPage from './pages/HoldingsPage'
import IncomePage from './pages/IncomePage'
import DocumentsPage from './pages/DocumentsPage'
import MessagesPage from './pages/MessagesPage'
import type { ReactNode } from 'react'

function RequireAuth({ children }: { children: ReactNode }) {
  const { client } = useAuth()
  if (!client) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const { client } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={client ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="holdings" element={<HoldingsPage />} />
        <Route path="income" element={<IncomePage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="messages" element={<MessagesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
