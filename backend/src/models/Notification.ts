import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType =
  | 'APPLICATION_STATUS_CHANGED'
  | 'INTERVIEW_SCHEDULED'
  | 'NEW_JOB_MATCH'
  | 'PROFILE_VIEWED'
  | 'MESSAGE_RECEIVED'
  | 'SYSTEM';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  linkUrl: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'APPLICATION_STATUS_CHANGED',
        'INTERVIEW_SCHEDULED',
        'NEW_JOB_MATCH',
        'PROFILE_VIEWED',
        'MESSAGE_RECEIVED',
        'SYSTEM',
      ],
      default: 'SYSTEM',
    },
    linkUrl: { type: String, default: '/candidate/dashboard' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
