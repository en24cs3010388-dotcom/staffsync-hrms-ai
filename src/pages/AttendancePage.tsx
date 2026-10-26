import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { attendanceApi } from '../services/api.ts';
import { AttendanceRecord } from '../types/index.ts';
import {
  Clock,
  Calendar,
  CheckCircle2,
  LogOut as LogOutIcon,
  Search,
  Filter,
  AlertCircle,
  FileText,
  UserCheck,
} from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const isElevated = user?.role === 'HR Admin' || user?.role === 'Manager';

  // Tabs: 'my' or 'all'
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');

  // Status for today
  const [todayStatus, setTodayStatus] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // My history
  const [myHistory, setMyHistory] = useState<AttendanceRecord[]>([]);
  const [myLoading, setMyLoading] = useState(true);

  // All records (for Manager / HR)
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
  const [allLoading, setAllLoading] = useState(false);
  const [allDate, setAllDate] = useState<string>('');
  const [allSearch, setAllSearch] = useState<string>('');
  const [allStatusFilter, setAllStatusFilter] = useState<string>('All');

  const loadTodayStatus = async () => {
    try {
      const res = await attendanceApi.getTodayStatus();
      setTodayStatus(res);
    } catch (err: any) {
      console.error('Failed to load today attendance:', err);
    }
  };

  const loadMyHistory = async () => {
    try {
      setMyLoading(true);
      const res = await attendanceApi.getMyHistory();
      setMyHistory(res.records);
    } catch (err: any) {
      console.error('Failed to load my attendance:', err);
    } finally {
      setMyLoading(false);
    }
  };

  const loadAllRecords = async () => {
    if (!isElevated) return;
    try {
      setAllLoading(true);
      const res = await attendanceApi.getAll({
        date: allDate || undefined,
        search: allSearch.trim() || undefined,
        status: allStatusFilter !== 'All' ? allStatusFilter : undefined,
      });
      setAllRecords(res.records);
    } catch (err: any) {
      console.error('Failed to load organization attendance:', err);
    } finally {
      setAllLoading(false);
    }
  };

  useEffect(() => {
    loadTodayStatus();
    loadMyHistory();
  }, []);

  useEffect(() => {
    if (activeTab === 'all' && isElevated) {
      loadAllRecords();
    }
  }, [activeTab, allDate, allSearch, allStatusFilter]);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setFeedbackMsg(null);
      const res = await attendanceApi.checkIn();
      setFeedbackMsg({ text: res.message, isError: false });
      await loadTodayStatus();
      await loadMyHistory();
    } catch (err: any) {
      setFeedbackMsg({ text: err.message, isError: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setFeedbackMsg(null);
      const res = await attendanceApi.checkOut();
      setFeedbackMsg({ text: res.message, isError: false });
      await loadTodayStatus();
      await loadMyHistory();
    } catch (err: any) {
      setFeedbackMsg({ text: err.message, isError: true });
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const att = todayStatus?.attendance;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <span>Attendance Management</span>
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Record your daily work shifts, track your attendance history, and view organization-wide logs.
        </p>
      </div>

      {/* Today's Punch Clock Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-wider text-gray-500">
                Today&apos;s Shift Status
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                {todayStatus?.date || 'Today'}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              {todayStatus?.hasCheckedOut ? (
                <span className="text-slate-700">Shift Completed ({att?.workHours} Hours)</span>
              ) : todayStatus?.hasCheckedIn ? (
                <span className="text-emerald-600">Currently Checked In</span>
              ) : (
                <span className="text-amber-600">Not Checked In Yet</span>
              )}
            </h2>

            {/* Time stamps */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 min-w-[140px]">
                <p className="text-gray-400 font-medium">Check-In Time</p>
                <p className="text-sm font-bold text-gray-800 mt-0.5">
                  {att?.checkIn ? formatTime(att.checkIn) : 'Not recorded'}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 min-w-[140px]">
                <p className="text-gray-400 font-medium">Check-Out Time</p>
                <p className="text-sm font-bold text-gray-800 mt-0.5">
                  {att?.checkOut ? formatTime(att.checkOut) : 'In progress...'}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 min-w-[140px]">
                <p className="text-gray-400 font-medium">Total Work Hours</p>
                <p className="text-sm font-bold text-blue-700 mt-0.5">
                  {att?.workHours ? `${att.workHours} hrs` : '--'}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 min-w-[200px]">
            {!todayStatus?.hasCheckedIn ? (
              <button
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <UserCheck className="w-5 h-5" />
                <span>{actionLoading ? 'Recording...' : 'Check In'}</span>
              </button>
            ) : !todayStatus?.hasCheckedOut ? (
              <button
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <LogOutIcon className="w-5 h-5" />
                <span>{actionLoading ? 'Recording...' : 'Check Out'}</span>
              </button>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center text-xs text-gray-600">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <span>Shift completed for today.</span>
              </div>
            )}

            {feedbackMsg && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  feedbackMsg.isError
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {feedbackMsg.isError ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                )}
                <span>{feedbackMsg.text}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-4">
        <button
          onClick={() => setActiveTab('my')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'my'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          My Attendance History
        </button>

        {isElevated && (
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>Organization Records</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700">
              {user?.role}
            </span>
          </button>
        )}
      </div>

      {/* Tab 1: My History */}
      {activeTab === 'my' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Recent Logged Days
            </h3>
            <span className="text-xs text-gray-500">{myHistory.length} records</span>
          </div>

          {myLoading ? (
            <div className="p-8 text-center text-xs text-gray-500">Loading your history...</div>
          ) : myHistory.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              No attendance records found yet. Check in above to start your log.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold uppercase">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Check-In</th>
                    <th className="px-6 py-3">Check-Out</th>
                    <th className="px-6 py-3">Work Hours</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {myHistory.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50/70">
                      <td className="px-6 py-3.5 font-semibold text-gray-900">{item.date}</td>
                      <td className="px-6 py-3.5 text-gray-700">{formatTime(item.checkIn)}</td>
                      <td className="px-6 py-3.5 text-gray-700">{formatTime(item.checkOut)}</td>
                      <td className="px-6 py-3.5 font-bold text-blue-600">
                        {item.workHours > 0 ? `${item.workHours} hrs` : '--'}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            item.status === 'Present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'Half-day'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-gray-500">{item.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: All Records (Privileged) */}
      {activeTab === 'all' && isElevated && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-wrap gap-3 items-center justify-between">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={allSearch}
                onChange={(e) => setAllSearch(e.target.value)}
                placeholder="Search employee name or code..."
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-medium text-gray-500">Date:</label>
                <input
                  type="date"
                  value={allDate}
                  onChange={(e) => setAllDate(e.target.value)}
                  className="px-2.5 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 bg-white"
                />
                {allDate && (
                  <button
                    onClick={() => setAllDate('')}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <label className="text-xs font-medium text-gray-500">Status:</label>
                <select
                  value={allStatusFilter}
                  onChange={(e) => setAllStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 bg-white"
                >
                  <option value="All">All</option>
                  <option value="Present">Present</option>
                  <option value="Half-day">Half-day</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            {allLoading ? (
              <div className="p-8 text-center text-xs text-gray-500">Loading organization records...</div>
            ) : allRecords.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">No records match the filter criteria.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 font-semibold uppercase">
                    <tr>
                      <th className="px-6 py-3">Employee</th>
                      <th className="px-6 py-3">Code</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Check-In</th>
                      <th className="px-6 py-3">Check-Out</th>
                      <th className="px-6 py-3">Work Hours</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {allRecords.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50/70">
                        <td className="px-6 py-3.5 font-semibold text-gray-900">{item.employeeName}</td>
                        <td className="px-6 py-3.5 font-mono text-gray-600">{item.employeeCode}</td>
                        <td className="px-6 py-3.5 text-gray-700">{item.date}</td>
                        <td className="px-6 py-3.5 text-gray-700">{formatTime(item.checkIn)}</td>
                        <td className="px-6 py-3.5 text-gray-700">{formatTime(item.checkOut)}</td>
                        <td className="px-6 py-3.5 font-bold text-blue-600">
                          {item.workHours > 0 ? `${item.workHours} hrs` : '--'}
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              item.status === 'Present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'Half-day'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
