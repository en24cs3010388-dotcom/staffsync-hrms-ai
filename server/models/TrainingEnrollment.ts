import mongoose, { Schema, Document } from 'mongoose';

export type EnrollmentStatus = 'Enrolled' | 'In Progress' | 'Completed' | 'Dropped';

export interface ITrainingEnrollment extends Document {
  training: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  employeeCode: string;
  employeeName: string;
  department: string;
  enrollmentDate: Date;
  status: EnrollmentStatus;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TrainingEnrollmentSchema = new Schema<ITrainingEnrollment>(
  {
    training: {
      type: Schema.Types.ObjectId,
      ref: 'Training',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    employeeCode: {
      type: String,
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      default: 'General',
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Enrolled', 'In Progress', 'Completed', 'Dropped'],
      default: 'Enrolled',
    },
    feedback: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

TrainingEnrollmentSchema.index({ training: 1, user: 1 }, { unique: true });

export const TrainingEnrollment = mongoose.models.TrainingEnrollment || mongoose.model<ITrainingEnrollment>('TrainingEnrollment', TrainingEnrollmentSchema);
