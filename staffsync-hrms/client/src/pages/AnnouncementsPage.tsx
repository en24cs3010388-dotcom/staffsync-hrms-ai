import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { announcementsApi } from '../services/api.ts';
import { AnnouncementItem } from '../types/index.ts';
import { Modal } from '../components/Modal.tsx';
import {
  Megaphone,
  Plus,
  Edit2,
  Archive,
  ArchiveRestore,
  Tag,
  AlertTriangle,
  Calendar,
  User,
  CheckCircle2,
} from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const isHR = user?.role === 'HR Admin';

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Published');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AnnouncementItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    priority: 'Medium',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const categories = ['General', 'Policy', 'Event', 'Urgent', 'Holiday'];

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await announcementsApi.getAll({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        status: isHR ? (statusFilter !== 'All' ? statusFilter : undefined) : 'Published',
      });
      setAnnouncements(res.announcements);
    } catch (err: any) {
      setError(err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, [selectedCategory, statusFilter]);

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      content: '',
      category: 'General',
      priority: 'Medium',
    });
    setFormError(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (item: AnnouncementItem) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category,
      priority: item.priority,
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setFormError('Title and content are required.');
      return;
    }
    try {
      setSubmitting(true);
      setFormError(null);
      await announcementsApi.create(formData);
      setIsCreateOpen(false);
      await loadAnnouncements();
    } catch (err: any) {
      setFormError(err.message || 'Failed to publish announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      setSubmitting(true);
      setFormError(null);
      await announcementsApi.update(selectedItem._id, formData);
      setIsEditOpen(false);
      await loadAnnouncements();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleArchive = async (item: AnnouncementItem) => {
    try {
      await announcementsApi.toggleArchive(item._id);
      await loadAnnouncements();
    } catch (err: any) {
      setError(err.message || 'Action failed');
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3 h-3" /> High Priority
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">
            Low Priority
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-700 border border-blue-200">
            Standard Notice
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-blue-600" />
            <span>Announcements & Company Notices</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {isHR
              ? 'Publish corporate announcements, workplace policies, event invitations, and manage notices.'
              : 'Stay up to date with company policies, office events, and urgent communications.'}
          </p>
        </div>

        {isHR && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Announcement</span>
          </button>
        )}
      </div>

      {/* Categories & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        {/* Category filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* HR Status Filter */}
        {isHR && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 border border-gray-300 rounded-md text-xs text-gray-900 bg-white"
            >
              <option value="Published">Published Only</option>
              <option value="Archived">Archived Only</option>
              <option value="All">All Records</option>
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Announcements Feed */}
      {loading ? (
        <div className="p-12 text-center text-xs text-gray-500">Loading announcements...</div>
      ) : announcements.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-gray-200 text-center">
          <Megaphone className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-gray-800">No announcements found</h3>
          <p className="text-xs text-gray-500 mt-1">There are no notices published in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-xl border p-5 shadow-2xs flex flex-col justify-between transition-all ${
                item.status === 'Archived' ? 'opacity-60 bg-gray-50 border-gray-300' : 'border-gray-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {item.category}
                    </span>
                    {getPriorityBadge(item.priority)}
                  </div>
                  {item.status === 'Archived' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                      Archived
                    </span>
                  )}
                </div>

                <h2 className="text-base font-bold text-gray-900 mb-2 leading-snug">{item.title}</h2>
                <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{item.content}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <div className="flex items-center gap-2">
                  <span>By <strong className="text-gray-700">{item.authorName}</strong></span>
                  <span>•</span>
                  <span>{new Date(item.publishDate).toLocaleDateString()}</span>
                </div>

                {isHR && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                      title="Edit Notice"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleArchive(item)}
                      className="p-1 text-gray-400 hover:text-amber-600 transition-colors cursor-pointer"
                      title={item.status === 'Published' ? 'Archive Notice' : 'Unarchive Notice'}
                    >
                      {item.status === 'Published' ? (
                        <Archive className="w-3.5 h-3.5" />
                      ) : (
                        <ArchiveRestore className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Publish New Company Announcement"
      >
        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Headline / Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Office Holiday Schedule Update"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Priority Level *</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High (Urgent Alert)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Content / Message Body *</label>
            <textarea
              required
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write the full announcement details here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-900"
            />
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
              disabled={submitting}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Announcement Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Announcement"
      >
        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            {formError}
          </div>
        )}

        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Headline / Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Priority Level *</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High (Urgent Alert)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Content / Message Body *</label>
            <textarea
              required
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
