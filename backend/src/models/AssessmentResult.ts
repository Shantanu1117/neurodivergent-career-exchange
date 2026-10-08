import mongoose, { Document, Schema } from 'mongoose';

export interface IAssessmentResult extends Document {
  candidateId: mongoose.Types.ObjectId;
  answers: Array<{
    questionId: number;
    selectedOptionIndex: number;
  }>;
  scores: {
    qaTesting: number;
    cybersecurity: number;
    dataAudit: number;
    softwareDev: number;
    uiUx: number;
    researchDoc: number;
  };
  primaryMatch: string;
  explanations: Array<{
    category: string;
    score: number;
    rationale: string;
    strengthsCited: string[];
  }>;
  completedAt: Date;
}

const AssessmentResultSchema = new Schema<IAssessmentResult>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'CandidateProfile',
      required: true,
    },
    answers: [
      {
        questionId: Number,
        selectedOptionIndex: Number,
      },
    ],
    scores: {
      qaTesting: { type: Number, required: true },
      cybersecurity: { type: Number, required: true },
      dataAudit: { type: Number, required: true },
      softwareDev: { type: Number, required: true },
      uiUx: { type: Number, required: true },
      researchDoc: { type: Number, required: true },
    },
    primaryMatch: { type: String, required: true },
    explanations: [
      {
        category: String,
        score: Number,
        rationale: String,
        strengthsCited: [String],
      },
    ],
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const AssessmentResult = mongoose.model<IAssessmentResult>(
  'AssessmentResult',
  AssessmentResultSchema
);
