import mongoose, { Document, Schema } from 'mongoose';

export interface ISavedJob extends Document {
  candidateId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const SavedJobSchema = new Schema<ISavedJob>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'CandidateProfile',
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
  },
  { timestamps: true }
);

SavedJobSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });

export const SavedJob = mongoose.model<ISavedJob>('SavedJob', SavedJobSchema);
