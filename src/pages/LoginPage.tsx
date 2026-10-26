import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { Shield, Briefcase, User, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-blue-600 items-center justify-center text-white font-extrabold text-2xl shadow-md mb-3">
          S
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">StaffSync HRMS</h1>
        <p className="mt-1 text-sm text-gray-500">Human Resource Management System Portal</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-gray-200 sm:rounded-xl sm:px-10">
          {/* Quick Demo Selector */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Quick Demo Accounts:
              </span>
              <span className="text-[11px] text-gray-500">Click to fill</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@staffsync.com', 'Password123!')}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-rose-200 bg-rose-50/70 hover:bg-rose-100/70 text-rose-800 transition-colors cursor-pointer text-center"
              >
                <Shield className="w-4 h-4 mb-1 text-rose-600" />
                <span className="text-xs font-bold leading-tight">HR Admin</span>
                <span className="text-[10px] text-rose-600">Sarah</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('manager@staffsync.com', 'Password123!')}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-800 transition-colors cursor-pointer text-center"
              >
                <Briefcase className="w-4 h-4 mb-1 text-indigo-600" />
                <span className="text-xs font-bold leading-tight">Manager</span>
                <span className="text-[10px] text-indigo-600">Michael</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('employee@staffsync.com', 'Password123!')}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800 transition-colors cursor-pointer text-center"
              >
                <User className="w-4 h-4 mb-1 text-emerald-600" />
                <span className="text-xs font-bold leading-tight">Employee</span>
                <span className="text-[10px] text-emerald-600">Alex</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@staffsync.com"
                  required
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-xs text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo account reference box */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-[11px] text-gray-500 leading-relaxed">
            <span className="font-semibold text-gray-600">Default Password:</span> <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">Password123!</code> for all demo accounts.
          </div>
        </div>
      </div>
    </div>
  );
};
