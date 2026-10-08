import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  logo?: string;
  website?: string;
  industry: string;
  companySize: string;
  location: string;
  about: string;
  accommodationsOffered: string[];
  verified: boolean;
  cultureHighlights: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EmployerProfileSchema = new Schema<IEmployerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: { type: String, required: true },
    logo: { type: String, default: '' },
    website: { type: String, default: '' },
    industry: { type: String, default: 'Technology & Software' },
    companySize: { type: String, default: '50-250 employees' },
    location: { type: String, default: 'Remote / Global' },
    about: { type: String, default: 'A neuro-inclusive organization committed to strengths-based hiring.' },
    accommodationsOffered: [{ type: String }],
    verified: { type: Boolean, default: true },
    cultureHighlights: [{ type: String }],
  },
  { timestamps: true }
);

export const EmployerProfile = mongoose.model<IEmployerProfile>('EmployerProfile', EmployerProfileSchema);
