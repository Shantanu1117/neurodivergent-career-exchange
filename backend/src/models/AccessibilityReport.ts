import mongoose, { Document, Schema } from 'mongoose';

export interface IAccessibilityReport extends Document {
  pageUrl: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  reporterEmail?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AccessibilityReportSchema = new Schema<IAccessibilityReport>(
  {
    pageUrl: { type: String, required: true, default: '/' },
    category: {
      type: String,
      default: 'COGNITIVE_LOAD',
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    description: { type: String, required: true },
    reporterEmail: { type: String, default: '' },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED'],
      default: 'OPEN',
    },
    adminNote: { type: String, default: '' },
  },
  { timestamps: true }
);

export const AccessibilityReport = mongoose.model<IAccessibilityReport>(
  'AccessibilityReport',
  AccessibilityReportSchema
);
