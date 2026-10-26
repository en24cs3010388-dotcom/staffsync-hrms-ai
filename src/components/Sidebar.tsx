import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarCheck2,
  Megaphone,
  GraduationCap,
  Info,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['HR Admin', 'Manager', 'Employee'],
    },
    {
      to: '/employees',
      label: user?.role === 'HR Admin' ? 'Employee Directory & HR' : 'Employee Directory',
      icon: Users,
      roles: ['HR Admin', 'Manager', 'Employee'],
      badge: user?.role === 'HR Admin' ? 'Admin' : undefined,
    },
    {
      to: '/attendance',
      label: 'Attendance',
      icon: Clock,
      roles: ['HR Admin', 'Manager', 'Employee'],
    },
    {
      to: '/leaves',
      label: 'Leave Requests',
      icon: CalendarCheck2,
      roles: ['HR Admin', 'Manager', 'Employee'],
      badge: (user?.role === 'HR Admin' || user?.role === 'Manager') ? 'Review' : undefined,
    },
    {
      to: '/announcements',
      label: 'Announcements',
      icon: Megaphone,
      roles: ['HR Admin', 'Manager', 'Employee'],
    },
    {
      to: '/training',
      label: 'Training & Skills',
      icon: GraduationCap,
      roles: ['HR Admin', 'Manager', 'Employee'],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
      <div className="p-4 border-b border-slate-800">
        <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Main Navigation</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-300 border border-blue-400/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Role info card at bottom */}
      <div className="p-4 m-3 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 space-y-2">
        <div>
          <div className="flex items-center gap-1.5 font-semibold text-white mb-1">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>Active Role Access</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Logged in as <strong className="text-white">{user?.role}</strong> ({user?.employeeId}).
            {user?.role === 'HR Admin' && ' Full management privileges enabled.'}
            {user?.role === 'Manager' && ' Team review & directory enabled.'}
            {user?.role === 'Employee' && ' Personal attendance & self-service enabled.'}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
          <span className="text-slate-400">Database Engine:</span>
          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            MongoDB Mongoose
          </span>
        </div>
      </div>
    </aside>
  );
};
