export type UserRole = 'HR Admin' | 'Manager' | 'Employee';
export type LeaveType = 'Casual Leave' | 'Sick Leave' | 'Paid Leave' | 'Unpaid Leave' | 'Maternity/Paternity Leave';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId: string;
  status: 'Active' | 'Inactive';
  department?: string;
  position?: string;
}

export interface Employee {
  _id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  dateOfJoining: string;
  salary?: number;
  status: 'Active' | 'Inactive';
  address?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  _id: string;
  user: string;
  employeeCode: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkIn?: string;
  checkOut?: string;
  status: 'Present' | 'Absent' | 'Half-day' | 'On Leave';
  workHours: number;
  notes?: string;
  createdAt: string;
}

export interface LeaveRequestItem {
  _id: string;
  user: string;
  employeeCode: string;
  employeeName: string;
  leaveType: 'Casual Leave' | 'Sick Leave' | 'Paid Leave' | 'Unpaid Leave' | 'Maternity/Paternity Leave';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewedBy?: string;
  reviewedByName?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface AnnouncementItem {
  _id: string;
  title: string;
  content: string;
  category: 'General' | 'Policy' | 'Event' | 'Urgent' | 'Holiday';
  priority: 'Low' | 'Medium' | 'High';
  author: string;
  authorName: string;
  status: 'Published' | 'Archived';
  publishDate: string;
  createdAt: string;
}

export interface TrainingProgram {
  _id: string;
  title: string;
  description: string;
  trainer: string;
  department: string;
  startDate: string;
  endDate: string;
  capacity: number;
  enrolledCount: number;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  createdBy: string;
  isEnrolled?: boolean;
  createdAt: string;
}

export interface TrainingParticipant {
  _id: string;
  training: string;
  user: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  enrollmentDate: string;
  status: string;
}
