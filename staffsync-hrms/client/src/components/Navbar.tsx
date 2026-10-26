import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { LogOut, User as UserIcon, Shield, Briefcase, Calendar } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'HR Admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <Shield className="w-3 h-3" />
            HR Admin
          </span>
        );
      case 'Manager':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Briefcase className="w-3 h-3" />
            Manager
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <UserIcon className="w-3 h-3" />
            Employee
          </span>
        );
    }
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-gray-900">StaffSync</span>
                <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                  HRMS
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block">Human Resource Management System</p>
            </div>
          </div>

          {/* User Profile & Actions */}
          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>{todayStr}</span>
              </div>

              <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800 leading-tight">{user.name}</span>
                    {getRoleBadge(user.role)}
                  </div>
                  <p className="text-xs text-gray-500">{user.employeeId} • {user.email}</p>
                </div>

                <button
                  onClick={() => logout()}
                  title="Logout"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-red-700 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-md transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
