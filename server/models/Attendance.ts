import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  user: mongoose.Types.ObjectId;
  employeeCode: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkIn?: Date;
  checkOut?: Date;
  status: 'Present' | 'Absent' | 'Half-day' | 'On Leave';
  workHours: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
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
    date: {
      type: String,
      required: true,
      index: true, // Format: YYYY-MM-DD
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Half-day', 'On Leave'],
      default: 'Present',
    },
    workHours: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure 1 attendance record per user per day
AttendanceSchema.index({ user: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
