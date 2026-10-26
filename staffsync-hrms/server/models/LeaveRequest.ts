import mongoose, { Schema, Document } from 'mongoose';

export type LeaveType = 'Casual Leave' | 'Sick Leave' | 'Paid Leave' | 'Unpaid Leave' | 'Maternity/Paternity Leave';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface ILeaveRequest extends Document {
  user: mongoose.Types.ObjectId;
  employeeCode: string;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedByName?: string;
  reviewNotes?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    employeeCode: {
      type: String,
      required: true,
      trim: true,
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    leaveType: {
      type: String,
      enum: ['Casual Leave', 'Sick Leave', 'Paid Leave', 'Unpaid Leave', 'Maternity/Paternity Leave'],
      required: [true, 'Leave type is required'],
    },
    startDate: {
      type: String,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: String,
      required: [true, 'End date is required'],
    },
    daysCount: {
      type: Number,
      required: true,
      min: [1, 'Leave must be for at least 1 day'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for leave is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedByName: {
      type: String,
      trim: true,
    },
    reviewNotes: {
      type: String,
      trim: true,
      default: '',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const LeaveRequest = mongoose.models.LeaveRequest || mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);
