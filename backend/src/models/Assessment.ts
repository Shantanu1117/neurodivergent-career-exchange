import mongoose, { Document, Schema } from 'mongoose';

export interface IAssessmentQuestion extends Document {
  questionId: number;
  prompt: string;
  categoryDimension: string;
  options: Array<{
    text: string;
    weights: {
      qaTesting: number;
      cybersecurity: number;
      dataAudit: number;
      softwareDev: number;
      uiUx: number;
      researchDoc: number;
    };
  }>;
}

const AssessmentQuestionSchema = new Schema<IAssessmentQuestion>({
  questionId: { type: Number, required: true, unique: true },
  prompt: { type: String, required: true },
  categoryDimension: { type: String, required: true },
  options: [
    {
      text: { type: String, required: true },
      weights: {
        qaTesting: { type: Number, default: 0 },
        cybersecurity: { type: Number, default: 0 },
        dataAudit: { type: Number, default: 0 },
        softwareDev: { type: Number, default: 0 },
        uiUx: { type: Number, default: 0 },
        researchDoc: { type: Number, default: 0 },
      },
    },
  ],
});

export const AssessmentQuestion = mongoose.model<IAssessmentQuestion>(
  'AssessmentQuestion',
  AssessmentQuestionSchema
);
