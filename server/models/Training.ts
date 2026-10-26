import mongoose, { Schema, Document } from 'mongoose';

export type TrainingStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';

export interface ITraining extends Document {
  title: string;
  description: string;
  trainer: string;
  department: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  capacity: number;
  enrolledCount: number;
  status: TrainingStatus;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TrainingSchema = new Schema<ITraining>(
  {
    title: {
      type: String,
      required: [true, 'Training title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Training description is required'],
      trim: true,
    },
    trainer: {
      type: String,
      required: [true, 'Trainer name is required'],
      trim: true,
    },
    department: {
      type: String,
      default: 'All Departments',
      trim: true,
    },
    startDate: {
      type: String,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: String,
      required: [true, 'End date is required'],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      default: 20,
    },
    enrolledCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Upcoming',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Training = mongoose.models.Training || mongoose.model<ITraining>('Training', TrainingSchema);
