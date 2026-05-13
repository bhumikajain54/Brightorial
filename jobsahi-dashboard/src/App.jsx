import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './shared/hooks/useTheme.jsx'
import Login from './shared/auth/Login.jsx'
import CreateAccount from './shared/auth/CreateAccount.jsx'
import RoleRoute from './RoleRoute.jsx'
import ForgotPassword from './shared/auth/ForgotPassword.jsx'
import ScrollToTop from './shared/components/ScrollToTop.jsx'

const AdminRoutes = lazy(() => import('./features/admin/routes.jsx'))
const RecruiterRoutes = lazy(() => import('./features/recruiter/routes.jsx'))
const InstituteRoutes = lazy(() => import('./features/institute/routes.jsx'))
const WebsiteRoutes = lazy(() => import('./features/website/routes.jsx'))

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <Suspense fallback={<div className="p-8">Loading...</div>}>
          <Routes>
            <Route path="/*" element={<WebsiteRoutes />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/*" element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminRoutes />
              </RoleRoute>
            } />
            <Route path="/recruiter/*" element={
              <RoleRoute allowedRoles={['recruiter']}>
                <RecruiterRoutes />
              </RoleRoute>
            } />
            <Route path="/institute/*" element={
              <RoleRoute allowedRoles={['institute']}>
                <InstituteRoutes />
              </RoleRoute>
            } />
            <Route path="*" element={<div className="p-8">404 — Not Found</div>} />
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  )
}
