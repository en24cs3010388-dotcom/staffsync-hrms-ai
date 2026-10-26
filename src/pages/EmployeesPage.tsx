import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { employeesApi } from '../services/api.ts';
import { Employee } from '../types/index.ts';
import { Modal } from '../components/Modal.tsx';
import {
  Users,
  Search,
  Plus,
  Edit2,
  UserX,
  UserCheck,
  Mail,
  Phone,
  Briefcase,
  Building,
  Calendar,
  AlertCircle,
  DollarSign,
} from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const { user } = useAuth();
  const isHR = user?.role === 'HR Admin';

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Engineering',
    position: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
    salary: 75000,
    address: '',
    role: 'Employee',
    password: 'Password123!',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const departmentsList = [
    'Engineering',
    'Human Resources',
    'Marketing',
    'Sales',
    'Finance',
    'Operations',
  ];

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await employeesApi.getAll({
        search: search.trim() || undefined,
        department: department !== 'All' ? department : undefined,
        status: status !== 'All' ? status : undefined,
      });
      setEmployees(res.employees);
    } catch (err: any) {
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEmployees();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, department, status]);

  const handleOpenAdd = () => {
    // Generate next employee code
    const nextCode = `EMP${String(employees.length + 1).padStart(3, '0')}`;
    setFormData({
      employeeCode: nextCode,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: 'Engineering',
      position: '',
      dateOfJoining: new Date().toISOString().split('T')[0],
      salary: 75000,
      address: '',
      role: 'Employee',
      password: 'Password123!',
    });
    setFormError(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setFormData({
      employeeCode: emp.employeeCode,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone || '',
      department: emp.department,
      position: emp.position,
      dateOfJoining: emp.dateOfJoining ? emp.dateOfJoining.split('T')[0] : '',
      salary: emp.salary || 0,
      address: emp.address || '',
      role: 'Employee',
      password: '',
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormSubmitting(true);
      setFormError(null);
      await employeesApi.create(formData);
      setIsAddOpen(false);
      await loadEmployees();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create employee');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    try {
      setFormSubmitting(true);
      setFormError(null);
      await employeesApi.update(selectedEmployee._id, formData);
      setIsEditOpen(false);
      await loadEmployees();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update employee');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (emp: Employee) => {
    try {
      await employeesApi.toggleStatus(emp._id);
      await loadEmployees();
    } catch (err: any) {
      setError(err.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Employee Directory</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {isHR
              ? 'Manage organizational staff, modify employee details, adjust roles, or toggle employment status.'
              : 'Browse company team members, view departments, and access internal contact information.'}
          </p>
        </div>

        {isHR && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        )}
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, code..."
            className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <label className="text-xs font-medium text-gray-500 whitespace-nowrap">Department:</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Departments</option>
              {departmentsList.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <label className="text-xs font-medium text-gray-500 whitespace-nowrap">Status:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Employee List Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-500">Loading directory...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-gray-800">No employees found</h3>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your search criteria or add a new employee.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Department & Role</th>
                  <th className="px-6 py-3">Contact</th>
                  {isHR && <th className="px-6 py-3">Salary</th>}
                  <th className="px-6 py-3">Status</th>
                  {isHR && <th className="px-6 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                          {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{emp.firstName} {emp.lastName}</p>
                          <p className="text-[11px] text-gray-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        {emp.employeeCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-800">{emp.position}</p>
                      <p className="text-[11px] text-gray-500">{emp.department}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      <div className="space-y-0.5 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span>{emp.email}</span>
                        </div>
                        {emp.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{emp.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    {isHR && (
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        ${emp.salary ? emp.salary.toLocaleString() : 'N/A'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          emp.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    {isHR && (
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          title="Edit Employee"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(emp)}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            emp.status === 'Active'
                              ? 'text-gray-500 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={emp.status === 'Active' ? 'Deactivate Employee' : 'Activate Employee'}
                        >
                          {emp.status === 'Active' ? (
                            <UserX className="w-3.5 h-3.5" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Employee Modal (HR Only) */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register New Employee & User Account"
        maxWidth="max-w-2xl"
      >
        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Employee Code *</label>
              <input
                type="text"
                required
                value={formData.employeeCode}
                onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value.toUpperCase() })}
                placeholder="EMP006"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Role / Access Level *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 bg-white"
              >
                <option value="Employee">Employee (Default)</option>
                <option value="Manager">Manager</option>
                <option value="HR Admin">HR Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Work Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="employee@staffsync.com"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Department *</label>
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
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Designation / Position *</label>
              <input
                type="text"
                required
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="e.g. Senior Software Engineer"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Annual Salary ($ USD)</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Joining</label>
              <input
                type="date"
                value={formData.dateOfJoining}
                onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Initial Login Password (Default: Password123!)
            </label>
            <input
              type="text"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {formSubmitting ? 'Registering...' : 'Create Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal (HR Only) */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Employee: ${selectedEmployee?.employeeCode}`}
        maxWidth="max-w-2xl"
      >
        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            {formError}
          </div>
        )}

        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
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
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Position / Title</label>
              <input
                type="text"
                required
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Salary ($ USD)</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {formSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
