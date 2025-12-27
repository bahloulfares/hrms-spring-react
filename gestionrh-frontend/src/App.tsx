import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './features/auth/components/LoginForm';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DepartmentsPage } from './features/departments/components/DepartmentsPage';
import { JobsPage } from './features/jobs/components/JobsPage';
import { EmployeesPage } from './features/employees/components/EmployeesPage';
import { useAppSelector, useAppDispatch } from './store/hooks';

import { checkAuth } from './features/auth/authSlice';

// Simple Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<div className="p-4">Bienvenue sur votre tableau de bord RH. Sélectionnez un menu à gauche.</div>} />
          <Route path="departments" element={<DepartmentsPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="employees" element={<EmployeesPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
