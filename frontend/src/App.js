import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudents from './pages/AdminStudents';
import AdminStudentDetail from './pages/AdminStudentDetail';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route wrapper
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={
        user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace /> : <Navigate to="/login" replace />
      } />
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

      {/* Student Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/students" element={
        <ProtectedRoute requiredRole="admin"><AdminStudents /></ProtectedRoute>
      } />
      <Route path="/admin/students/:id" element={
        <ProtectedRoute requiredRole="admin"><AdminStudentDetail /></ProtectedRoute>
      } />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1a2235', color: '#f1f5f9', border: '1px solid #1e2d45', fontFamily: "'DM Sans', sans-serif", fontSize: '14px' },
            success: { iconTheme: { primary: '#10b981', secondary: '#0a0e1a' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#0a0e1a' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
