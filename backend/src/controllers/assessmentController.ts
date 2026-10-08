import { Request, Response } from 'express';
import { ASSESSMENT_QUESTIONS, AssessmentService } from '../services/assessmentService.js';
import { AssessmentResult } from '../models/AssessmentResult.js';
import { CandidateProfile } from '../models/CandidateProfile.js';

export class AssessmentController {
  public static async getQuestions(req: Request, res: Response): Promise<void> {
    try {
      // Strip weights from client response to prevent bias/gaming
      const sanitizedQuestions = ASSESSMENT_QUESTIONS.map((q) => ({
        questionId: q.questionId,
        prompt: q.prompt,
        categoryDimension: q.categoryDimension,
        options: q.options.map((opt) => ({ text: opt.text })),
      }));

      res.json({ success: true, questions: sanitizedQuestions });
    } catch (err: any) {
      console.error('getQuestions error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve assessment questions.' });
    }
  }

  public static async submitAssessment(req: Request, res: Response): Promise<void> {
    try {
      const { answers } = req.body;

      if (!answers || !Array.isArray(answers) || answers.length === 0) {
        res.status(400).json({ success: false, message: 'Valid answers array is required.' });
        return;
      }

      const candidate = await CandidateProfile.findOne({ userId: req.user?.userId });
      if (!candidate) {
        res.status(404).json({ success: false, message: 'Candidate profile not found.' });
        return;
      }

      const calculated = AssessmentService.calculateScores(answers);

      // Save historic record
      const resultDoc = await AssessmentResult.create({
        candidateId: candidate._id,
        answers,
        scores: calculated.scores,
        primaryMatch: calculated.primaryMatch,
        explanations: calculated.explanations,
        completedAt: new Date(),
      });

      // Update snapshot on candidate profile
      candidate.assessmentResults = {
        ...calculated.scores,
        primaryMatch: calculated.primaryMatch,
        completedAt: new Date(),
      };
      await candidate.save();

      res.status(201).json({
        success: true,
        resultId: resultDoc._id,
        scores: calculated.scores,
        primaryMatch: calculated.primaryMatch,
        explanations: calculated.explanations,
      });
    } catch (err: any) {
      console.error('submitAssessment error:', err);
      res.status(500).json({ success: false, message: 'Failed to process assessment.' });
    }
  }

  public static async getMyResults(req: Request, res: Response): Promise<void> {
    try {
      const candidate = await CandidateProfile.findOne({ userId: req.user?.userId });
      if (!candidate) {
        res.status(404).json({ success: false, message: 'Candidate profile not found.' });
        return;
      }

      const latest = await AssessmentResult.findOne({ candidateId: candidate._id }).sort({
        completedAt: -1,
      });

      if (!latest) {
        res.json({ success: true, hasTakenAssessment: false, results: null });
        return;
      }

      res.json({
        success: true,
        hasTakenAssessment: true,
        scores: latest.scores,
        primaryMatch: latest.primaryMatch,
        explanations: latest.explanations,
        completedAt: latest.completedAt,
      });
    } catch (err: any) {
      console.error('getMyResults error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve assessment results.' });
    }
  }
}
