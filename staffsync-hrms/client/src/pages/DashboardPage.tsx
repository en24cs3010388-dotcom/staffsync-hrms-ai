import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { dashboardApi, attendanceApi, trainingApi } from '../services/api.ts';
import {
  Users,
  Clock,
  CalendarCheck2,
  GraduationCap,
  Megaphone,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  UserCheck,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick attendance actions
  const [checkingAttendance, setCheckingAttendance] = useState(false);
  const [attendanceMessage, setAttendanceMessage] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardApi.getStats();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleCheckIn = async () => {
    try {
      setCheckingAttendance(true);
      setAttendanceMessage(null);
      const res = await attendanceApi.checkIn();
      setAttendanceMessage(res.message);
      await loadDashboard();
    } catch (err: any) {
      setAttendanceMessage(err.message);
    } finally {
      setCheckingAttendance(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setCheckingAttendance(true);
      setAttendanceMessage(null);
      const res = await attendanceApi.checkOut();
      setAttendanceMessage(res.message);
      await loadDashboard();
    } catch (err: any) {
      setAttendanceMessage(err.message);
    } finally {
      setCheckingAttendance(false);
    }
  };

  const handleQuickEnroll = async (trainingId: string) => {
    try {
      await trainingApi.enroll(trainingId);
      await loadDashboard();
    } catch (err: any) {
      setError(err.message || 'Enrollment failed');
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats;
  const userAtt = stats?.userAttendance;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/20 text-blue-100">
              {user?.role} Portal
            </span>
            <span className="text-xs text-blue-200">ID: {user?.employeeId}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm text-blue-100 mt-1 max-w-xl">
            {user?.role === 'HR Admin'
              ? 'You have complete administrative oversight of employees, organizational attendance, leave authorizations, announcements, and training catalogs.'
              : user?.role === 'Manager'
              ? 'Review pending departmental leave requests, team attendance records, and coordinate skill development programs.'
              : 'Log your daily check-in, monitor attendance history, submit leave applications, and enroll in professional development trainings.'}
          </p>
        </div>

        {/* Quick Check-in / Out Widget directly on Dashboard */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 min-w-[260px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-blue-100 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Today&apos;s Attendance
            </span>
            {userAtt?.hasCheckedOut ? (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-500/80 text-white">
                Completed ({userAtt.workHours}h)
              </span>
            ) : userAtt?.hasCheckedIn ? (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500 text-white animate-pulse">
                Active Present
              </span>
            ) : (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">
                Not Checked In
              </span>
            )}
          </div>

          <div className="flex gap-2 mt-3">
            {!userAtt?.hasCheckedIn ? (
              <button
                onClick={handleCheckIn}
                disabled={checkingAttendance}
                className="w-full py-2 px-3 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Check In Now</span>
              </button>
            ) : !userAtt?.hasCheckedOut ? (
              <button
                onClick={handleCheckOut}
                disabled={checkingAttendance}
                className="w-full py-2 px-3 rounded-md bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Check Out</span>
              </button>
            ) : (
              <div className="text-center w-full py-1 text-xs text-blue-100">
                Shift ended for today.
              </div>
            )}
          </div>

          {attendanceMessage && (
            <p className="mt-2 text-[11px] text-blue-200 text-center italic">
              {attendanceMessage}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Employees</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-900">{stats?.totalEmployees || 0}</span>
            <Link to="/employees" className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-0.5">
              Directory <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Checked In Today</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-900">{stats?.todayAttendanceCount || 0}</span>
            <Link to="/attendance" className="text-xs font-medium text-emerald-600 hover:text-emerald-800 flex items-center gap-0.5">
              Attendance <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Leaves</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-gray-900">{stats?.pendingLeavesCount || 0}</span>
              <span className="text-xs text-gray-500">total</span>
            </div>
            <Link to="/leaves" className="text-xs font-medium text-amber-600 hover:text-amber-800 flex items-center gap-0.5">
              Review <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Upcoming Trainings</span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-900">{stats?.upcomingTrainingsCount || 0}</span>
            <Link to="/training" className="text-xs font-medium text-purple-600 hover:text-purple-800 flex items-center gap-0.5">
              Catalog <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Announcements & Upcoming Trainings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-blue-600" />
                <h2 className="text-base font-bold text-gray-900">Company Announcements</h2>
              </div>
              <Link to="/announcements" className="text-xs font-semibold text-blue-600 hover:underline">
                View All
              </Link>
            </div>

            <div className="divide-y divide-gray-100 mt-3 space-y-3">
              {data?.recentAnnouncements?.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">No announcements published yet.</p>
              ) : (
                data?.recentAnnouncements?.map((item: any) => (
                  <div key={item._id} className="pt-3 first:pt-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.priority}
                      </span>
                      <span className="text-xs font-bold text-gray-800 line-clamp-1">{item.title}</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{item.content}</p>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1.5">
                      <span>By {item.authorName}</span>
                      <span>{new Date(item.publishDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Featured Upcoming Trainings */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <h2 className="text-base font-bold text-gray-900">Upcoming Training Programs</h2>
              </div>
              <Link to="/training" className="text-xs font-semibold text-purple-600 hover:underline">
                Full Catalog
              </Link>
            </div>

            <div className="divide-y divide-gray-100 mt-3 space-y-3">
              {data?.upcomingTrainings?.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">No upcoming training programs scheduled.</p>
              ) : (
                data?.upcomingTrainings?.map((tr: any) => (
                  <div key={tr._id} className="pt-3 first:pt-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-gray-900">{tr.title}</h3>
                      <span className="text-[11px] font-medium text-gray-500">
                        {tr.enrolledCount} / {tr.capacity} seats
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">{tr.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-gray-500">
                        Trainer: <strong className="text-gray-700">{tr.trainer}</strong>
                      </span>
                      <button
                        onClick={() => handleQuickEnroll(tr._id)}
                        className="px-2.5 py-1 text-xs font-medium rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer"
                      >
                        Enroll Now
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
