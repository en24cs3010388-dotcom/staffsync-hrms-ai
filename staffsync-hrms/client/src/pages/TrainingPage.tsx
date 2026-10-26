import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { trainingApi } from '../services/api.ts';
import { TrainingProgram, TrainingParticipant } from '../types/index.ts';
import { Modal } from '../components/Modal.tsx';
import {
  GraduationCap,
  Plus,
  Users,
  CheckCircle,
  Calendar,
  UserCheck,
  Building,
  AlertCircle,
  Clock,
} from 'lucide-react';

export const TrainingPage: React.FC = () => {
  const { user } = useAuth();
  const isHR = user?.role === 'HR Admin';
  const canViewParticipants = user?.role === 'HR Admin' || user?.role === 'Manager';

  const [activeTab, setActiveTab] = useState<'catalog' | 'my'>('catalog');
  const [trainings, setTrainings] = useState<TrainingProgram[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter
  const [statusFilter, setStatusFilter] = useState('All');

  // Create Modal (HR)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    trainer: '',
    department: 'All Departments',
    startDate: '',
    endDate: '',
    capacity: 25,
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Participants Modal (HR / Manager)
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [selectedTrainingTitle, setSelectedTrainingTitle] = useState('');
  const [participants, setParticipants] = useState<TrainingParticipant[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  const departmentsList = [
    'All Departments',
    'Engineering',
    'Human Resources',
    'Marketing',
    'Sales',
    'Finance',
    'Operations',
  ];

  const loadTrainings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await trainingApi.getAll({
        status: statusFilter !== 'All' ? statusFilter : undefined,
      });
      setTrainings(res.trainings);
    } catch (err: any) {
      setError(err.message || 'Failed to load trainings');
    } finally {
      setLoading(false);
    }
  };

  const loadMyEnrollments = async () => {
    try {
      const res = await trainingApi.getMyEnrollments();
      setMyEnrollments(res.enrollments);
    } catch (err: any) {
      console.error('Failed to load my enrollments:', err);
    }
  };

  useEffect(() => {
    loadTrainings();
    loadMyEnrollments();
  }, [statusFilter]);

  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handleEnroll = async (trainingId: string) => {
    try {
      setFeedbackMsg(null);
      const res = await trainingApi.enroll(trainingId);
      setFeedbackMsg({ text: res.message, isError: false });
      await loadTrainings();
      await loadMyEnrollments();
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Enrollment failed', isError: true });
    }
  };

  const handleOpenParticipants = async (tr: TrainingProgram) => {
    setSelectedTrainingTitle(tr.title);
    setIsParticipantsOpen(true);
    try {
      setParticipantsLoading(true);
      const res = await trainingApi.getParticipants(tr._id);
      setParticipants(res.participants);
    } catch (err: any) {
      setError(err.message || 'Failed to load participants');
    } finally {
      setParticipantsLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.trainer || !formData.startDate || !formData.endDate) {
      setCreateError('Please complete all required fields.');
      return;
    }

    try {
      setCreateSubmitting(true);
      setCreateError(null);
      await trainingApi.create(formData);
      setIsCreateOpen(false);
      await loadTrainings();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create training');
    } finally {
      setCreateSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <span>Training & Skill Development</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {isHR
              ? 'Organize skill-building workshops, manage seat capacities, and oversee enrolled staff.'
              : 'Upskill your professional competencies, browse courses, and register for workshops.'}
          </p>
        </div>

        {isHR && (
          <button
            onClick={() => {
              setFormData({
                title: '',
                description: '',
                trainer: '',
                department: 'All Departments',
                startDate: '',
                endDate: '',
                capacity: 25,
              });
              setCreateError(null);
              setIsCreateOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Training Program</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-4">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'catalog'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Training Programs Catalog ({trainings.length})
        </button>

        <button
          onClick={() => setActiveTab('my')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'my'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span>My Enrollments</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 font-bold">
            {myEnrollments.length}
          </span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {feedbackMsg && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            feedbackMsg.isError
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          {feedbackMsg.isError ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Catalog Tab */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">Status:</span>
            {['All', 'Upcoming', 'Ongoing', 'Completed'].map((st) => (
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

          {loading ? (
            <div className="p-12 text-center text-xs text-gray-500">Loading catalog...</div>
          ) : trainings.length === 0 ? (
            <div className="p-12 bg-white rounded-xl border border-gray-200 text-center">
              <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-gray-800">No training programs found</h3>
              <p className="text-xs text-gray-500 mt-1">There are no courses matching the current filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trainings.map((tr) => {
                const isFull = tr.enrolledCount >= tr.capacity;
                const percent = Math.min(100, Math.round((tr.enrolledCount / tr.capacity) * 100));

                return (
                  <div
                    key={tr._id}
                    className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          {tr.department}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            tr.status === 'Upcoming'
                              ? 'bg-blue-100 text-blue-800'
                              : tr.status === 'Ongoing'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {tr.status}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-gray-900 leading-snug">{tr.title}</h3>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                        {tr.description}
                      </p>

                      <div className="mt-3 space-y-1.5 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          <span>Trainer: <strong className="text-gray-700">{tr.trainer}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>Dates: {tr.startDate} to {tr.endDate}</span>
                        </div>
                      </div>

                      {/* Capacity progress */}
                      <div className="mt-4">
                        <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                          <span>Capacity Enrollment</span>
                          <span className="font-semibold text-gray-800">
                            {tr.enrolledCount} / {tr.capacity} seats ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isFull ? 'bg-rose-500' : 'bg-purple-600'}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      {canViewParticipants && (
                        <button
                          onClick={() => handleOpenParticipants(tr)}
                          className="text-xs text-gray-600 hover:text-blue-600 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>View Participants ({tr.enrolledCount})</span>
                        </button>
                      )}

                      <div className="ml-auto">
                        {tr.isEnrolled ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5" /> Enrolled
                          </span>
                        ) : isFull ? (
                          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-md border border-rose-200">
                            Full Capacity
                          </span>
                        ) : tr.status === 'Completed' ? (
                          <span className="text-xs font-medium text-gray-400">Completed</span>
                        ) : (
                          <button
                            onClick={() => handleEnroll(tr._id)}
                            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Enroll Now</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* My Enrollments Tab */}
      {activeTab === 'my' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          {myEnrollments.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              You haven&apos;t enrolled in any training programs yet. Explore the catalog tab to enroll.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {myEnrollments.map((enr) => {
                const program = enr.training;
                return (
                  <div key={enr._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-gray-900">{program?.title || 'Training Program'}</h3>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {enr.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Trainer: {program?.trainer} • Schedule: {program?.startDate} to {program?.endDate}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Enrolled on: {new Date(enr.enrollmentDate).toLocaleDateString()}
                      </p>
                    </div>

                    <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-md self-start sm:self-auto border border-purple-200">
                      Confirmed Seat
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create Training Modal (HR) */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Schedule New Training Workshop"
        maxWidth="max-w-xl"
      >
        {createError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            {createError}
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Program Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Advanced TypeScript & Clean Code"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Course Description *</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summary of learning outcomes and agenda..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Lead Trainer / Instructor *</label>
              <input
                type="text"
                required
                value={formData.trainer}
                onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
                placeholder="Trainer name"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Target Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 bg-white"
              >
                {departmentsList.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Seat Capacity *</label>
              <input
                type="number"
                min={1}
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createSubmitting}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {createSubmitting ? 'Creating...' : 'Publish Workshop'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Participants Modal (HR / Manager) */}
      <Modal
        isOpen={isParticipantsOpen}
        onClose={() => setIsParticipantsOpen(false)}
        title={`Enrolled Participants: ${selectedTrainingTitle}`}
        maxWidth="max-w-xl"
      >
        {participantsLoading ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading participants...</div>
        ) : participants.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            No employees have enrolled in this training program yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {participants.map((p) => (
              <div key={p._id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-gray-900">{p.employeeName}</p>
                  <p className="text-[11px] text-gray-500">{p.employeeCode} • {p.department}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {p.status}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {new Date(p.enrollmentDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-gray-200 mt-4">
          <button
            type="button"
            onClick={() => setIsParticipantsOpen(false)}
            className="px-4 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-200 cursor-pointer"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};
