import mongoose, { Schema, Document } from 'mongoose';

export type AnnouncementCategory = 'General' | 'Policy' | 'Event' | 'Urgent' | 'Holiday';
export type AnnouncementPriority = 'Low' | 'Medium' | 'High';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  author: mongoose.Types.ObjectId;
  authorName: string;
  status: 'Published' | 'Archived';
  publishDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Announcement content is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['General', 'Policy', 'Event', 'Urgent', 'Holiday'],
      default: 'General',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Published', 'Archived'],
      default: 'Published',
      index: true,
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Announcement = mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
