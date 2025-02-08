import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Events from './pages/Events'
import AdminDashboard from './pages/admin/Dashboard'
import AdminEvents from './pages/admin/Events'
import AdminUsers from './pages/admin/Users'
import MyEvents from './pages/MyEvents'
import Certificates from './pages/Certificates'
import Profile from './pages/Profile'
import Register from './pages/Register'
import { ToastProvider } from './contexts/ToastContext'
import AdminQuizPage from './pages/admin/CreateQuiz'
import ExamPage from './pages/ExamPage'
import EventsLeaderboard from './pages/Leaderboard';

function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/" />
  }

  // Redirect logged-in admin users to the admin dashboard
  if (user && profile?.role === 'admin' && !adminOnly) {
    return <Navigate to="/admin/dashboard" />
  }

  return <>{children}</>
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={
              <PrivateRoute>
                <Layout>
                  <Events />
                </Layout>
              </PrivateRoute>
            } />

            <Route path="/events" element={
              <PrivateRoute>
                <Layout>
                  <Events />
                </Layout>
              </PrivateRoute>
            } />

            <Route path="/my-events" element={
              <PrivateRoute>
                <Layout>
                  <MyEvents />
                </Layout>
              </PrivateRoute>
            } />

            <Route path="/certificates" element={
              <PrivateRoute>
                <Layout>
                  {/* <Certificates
                          participantName="Neel Pandya"
                          eventName="Hackathon 2025"
                          eventDate="January 28, 2025"
                          coordinator="Shekhar SIR"
                          organizer="Deepak Sir"
                        /> */}
                </Layout>
              </PrivateRoute>
            } />

            <Route path="/profile" element={
              <PrivateRoute>
                <Layout>
                  <Profile />
                </Layout>
              </PrivateRoute>
            } />

            <Route path="/admin/dashboard" element={
              <PrivateRoute adminOnly>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </PrivateRoute>
            } />

            <Route path="/admin/events" element={
              <PrivateRoute adminOnly>
                <Layout>
                  <AdminEvents />
                </Layout>
              </PrivateRoute>
            } />

            <Route path="/admin/users" element={
              <PrivateRoute adminOnly>
                <Layout>
                  <AdminUsers />
                </Layout>
              </PrivateRoute>
            } />

            <Route path="/admin/create-quiz/:eventId" element={
              <PrivateRoute adminOnly>
                <Layout>
                  <AdminQuizPage />
                </Layout>
              </PrivateRoute>
            } />
          </Routes>
        </AuthProvider>
      </Router>
      <Router>
        <Routes>
        <Route path="/exam/:eventId" element={<ExamPage />} />
        </Routes>
      </Router>
      <Router>
        <Routes>
        <Route path="/leaderboard/:eventId" element={<EventsLeaderboard />} />
        </Routes>
      </Router>
      <Router>
        <Routes>
        <Route path="/certificate/:eventId" element={<EventsLeaderboard />} />
        </Routes>
      </Router>
    </ToastProvider>
  )
}

export default App 