import mongoose, { Document, Schema } from 'mongoose';

export interface IResource extends Document {
  title: string;
  slug: string;
  category: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedTime: string;
  contentMarkdown: string;
  skillsGained: string[];
  externalUrl?: string;
  featured: boolean;
  createdAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
      default: 'BEGINNER',
    },
    estimatedTime: { type: String, default: '30 mins' },
    contentMarkdown: { type: String, default: '' },
    skillsGained: [{ type: String }],
    externalUrl: { type: String },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Resource = mongoose.model<IResource>('Resource', ResourceSchema);
