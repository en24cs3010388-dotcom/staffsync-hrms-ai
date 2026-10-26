import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole } from '../types/index.ts';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-600">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-white rounded-xl shadow-xs border border-red-200 text-center">
        <h2 className="text-lg font-bold text-red-700">Access Restricted</h2>
        <p className="text-sm text-gray-600 mt-2">
          Your current role (<strong className="capitalize">{user.role}</strong>) does not have access to this section.
        </p>
        <div className="mt-4">
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return <Outlet />;
};
