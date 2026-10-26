/**
 * StaffSync - Human Resource Management System
 * Full-stack MERN Application Entry Point
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { Layout } from './components/Layout.tsx';

// Pages
import { LoginPage } from './pages/LoginPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { EmployeesPage } from './pages/EmployeesPage.tsx';
import { AttendancePage } from './pages/AttendancePage.tsx';
import { LeavePage } from './pages/LeavePage.tsx';
import { AnnouncementsPage } from './pages/AnnouncementsPage.tsx';
import { TrainingPage } from './pages/TrainingPage.tsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/leaves" element={<LeavePage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/training" element={<TrainingPage />} />
            </Route>
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
