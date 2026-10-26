import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { leavesApi } from '../services/api.ts';
import { LeaveRequestItem, LeaveType } from '../types/index.ts';
import { Modal } from '../components/Modal.tsx';
import {
  CalendarCheck2,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  FileText,
  User,
  Filter,
} from 'lucide-react';

export const LeavePage: React.FC = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'HR Admin' || user?.role === 'Manager';

  const [activeTab, setActiveTab] = useState<'my' | 'manage'>('my');

  // My requests
  const [myRequests, setMyRequests] = useState<LeaveRequestItem[]>([]);
  const [myLoading, setMyLoading] = useState(true);

  // Manage requests
  const [allRequests, setAllRequests] = useState<LeaveRequestItem[]>([]);
  const [allLoading, setAllLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  // Apply Modal
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Review Modal
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequestItem | null>(null);
  const [reviewAction, setReviewAction] = useState<'Approved' | 'Rejected'>('Approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const leaveTypesList: LeaveType[] = [
    'Casual Leave',
    'Sick Leave',
    'Paid Leave',
    'Unpaid Leave',
    'Maternity/Paternity Leave',
  ];

  const loadMyRequests = async () => {
    try {
      setMyLoading(true);
      const res = await leavesApi.getMyLeaves();
      setMyRequests(res.requests);
    } catch (err: any) {
      console.error('Failed to load my leaves:', err);
    } finally {
      setMyLoading(false);
    }
  };

  const loadAllRequests = async () => {
    if (!canManage) return;
    try {
      setAllLoading(true);
      const res = await leavesApi.getAll({
        status: statusFilter !== 'All' ? statusFilter : undefined,
      });
      setAllRequests(res.requests);
    } catch (err: any) {
      console.error('Failed to load all leaves:', err);
    } finally {
      setAllLoading(false);
    }
  };

  useEffect(() => {
    loadMyRequests();
  }, []);

  useEffect(() => {
    if (activeTab === 'manage' && canManage) {
      loadAllRequests();
    }
  }, [activeTab, statusFilter]);

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const d1 = new Date(start);
    const d2 = new Date(end);
    if (d2 < d1) return 0;
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      setApplyError('Please fill in all required fields.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setApplyError('End date cannot be prior to start date.');
      return;
    }

    try {
      setApplySubmitting(true);
      setApplyError(null);
      await leavesApi.apply({
        leaveType,
        startDate,
        endDate,
        reason,
      });
      setIsApplyOpen(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      await loadMyRequests();
    } catch (err: any) {
      setApplyError(err.message || 'Failed to submit leave request');
    } finally {
      setApplySubmitting(false);
    }
  };

  const [reviewError, setReviewError] = useState<string | null>(null);

  const openReviewModal = (reqItem: LeaveRequestItem, action: 'Approved' | 'Rejected') => {
    setSelectedRequest(reqItem);
    setReviewAction(action);
    setReviewNotes('');
    setReviewError(null);
    setIsReviewOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      setReviewSubmitting(true);
      setReviewError(null);
      await leavesApi.updateStatus(selectedRequest._id, reviewAction, reviewNotes);
      setIsReviewOpen(false);
      await loadAllRequests();
      await loadMyRequests();
    } catch (err: any) {
      setReviewError(err.message || 'Failed to update leave status');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3" /> Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
    }
  };

  const daysCount = calculateDays(startDate, endDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarCheck2 className="w-5 h-5 text-blue-600" />
            <span>Leave Management</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Submit leave applications, track approval status, and manage team requests.
          </p>
        </div>

        <button
          onClick={() => {
            setStartDate('');
            setEndDate('');
            setReason('');
            setApplyError(null);
            setIsApplyOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
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
          My Leave Applications ({myRequests.length})
        </button>

        {canManage && (
          <button
            onClick={() => setActiveTab('manage')}
            className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'manage'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>Review Department Requests</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
              Queue
            </span>
          </button>
        )}
      </div>

      {/* Tab 1: My Applications */}
      {activeTab === 'my' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          {myLoading ? (
            <div className="p-8 text-center text-xs text-gray-500">Loading your applications...</div>
          ) : myRequests.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              You haven&apos;t submitted any leave requests yet. Click &quot;Apply for Leave&quot; above to submit one.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {myRequests.map((req) => (
                <div key={req._id} className="p-5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 font-bold flex items-center justify-center shrink-0">
                        {req.daysCount}d
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-900">{req.leaveType}</h3>
                          {getStatusBadge(req.status)}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {req.startDate} to {req.endDate} ({req.daysCount} total days)
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      Applied {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-3 bg-gray-50 p-3 rounded-lg text-xs text-gray-700 border border-gray-100">
                    <span className="font-semibold text-gray-600">Reason: </span>
                    <span>{req.reason}</span>
                  </div>

                  {req.reviewedBy && (
                    <div className="mt-2 text-xs text-gray-600 flex items-center gap-1.5">
                      <span className="font-semibold text-gray-500">Reviewed by {req.reviewedByName}:</span>
                      <span className="italic">{req.reviewNotes || 'No specific comment provided.'}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Manage Department Requests (HR / Manager) */}
      {activeTab === 'manage' && canManage && (
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">Filter Status:</span>
            {['All', 'Pending', 'Approved', 'Rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            {allLoading ? (
              <div className="p-8 text-center text-xs text-gray-500">Loading requests...</div>
            ) : allRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">
                No leave requests match the filter criteria.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {allRequests.map((req) => (
                  <div key={req._id} className="p-5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900 text-sm">{req.employeeName}</span>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                            {req.employeeCode}
                          </span>
                          {getStatusBadge(req.status)}
                        </div>
                        <p className="text-xs text-gray-600">
                          <strong>{req.leaveType}</strong> • {req.startDate} to {req.endDate} ({req.daysCount} days)
                        </p>
                        <p className="text-xs text-gray-500 mt-1.5 italic bg-gray-50 p-2.5 rounded-md border border-gray-100">
                          &quot;{req.reason}&quot;
                        </p>
                      </div>

                      {/* Review Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {req.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => openReviewModal(req, 'Approved')}
                              className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => openReviewModal(req, 'Rejected')}
                              className="px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : (
                          <div className="text-right text-xs text-gray-500">
                            <p>Reviewed by {req.reviewedByName}</p>
                            <p className="text-[10px] text-gray-400">
                              {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString() : ''}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        title="Submit Leave Application"
      >
        {applyError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            {applyError}
          </div>
        )}

        <form onSubmit={handleApplySubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Leave Type *</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as LeaveType)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 bg-white"
            >
              {leaveTypesList.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900"
              />
            </div>
          </div>

          {startDate && endDate && (
            <div className="text-xs text-blue-700 bg-blue-50 p-2.5 rounded-md font-medium">
              Calculated Duration: <strong>{daysCount} day(s)</strong>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Leave *</label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide context for your leave request..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsApplyOpen(false)}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={applySubmitting}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {applySubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Action Modal */}
      <Modal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title={`${reviewAction} Leave Request: ${selectedRequest?.employeeName}`}
      >
        {reviewError && (
          <div className="p-3 mb-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{reviewError}</span>
          </div>
        )}

        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <p className="text-xs text-gray-600">
            You are about to mark this leave request as{' '}
            <strong className={reviewAction === 'Approved' ? 'text-emerald-700' : 'text-rose-700'}>
              {reviewAction}
            </strong>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Reviewer Feedback / Comments (Optional)
            </label>
            <textarea
              rows={3}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="e.g. Approved, please coordinate handover before leaving."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsReviewOpen(false)}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reviewSubmitting}
              className={`px-4 py-1.5 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50 ${
                reviewAction === 'Approved'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {reviewSubmitting ? 'Processing...' : `Confirm ${reviewAction}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
