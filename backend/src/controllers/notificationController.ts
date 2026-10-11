import { Request, Response } from 'express';
import { Notification } from '../models/Notification.js';

export class NotificationController {
  public static async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      let notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      if (notifications.length === 0 && userId) {
        const isEmployer = req.user?.role === 'EMPLOYER';
        if (isEmployer) {
          await Notification.insertMany([
            {
              userId,
              title: 'Inclusive Hiring Pipeline Active',
              message: 'Your job listings are now indexed with Sensory Environment & 48h Advance Question badges.',
              type: 'SYSTEM_ANNOUNCEMENT',
              linkUrl: '/employer/dashboard',
              read: false,
            },
            {
              userId,
              title: 'High-Match Candidates Available',
              message: '3 candidates with 90%+ cognitive & technical alignment are ready for review.',
              type: 'JOB_MATCH_FOUND',
              linkUrl: '/employer/applications',
              read: false,
            },
          ]);
        } else {
          await Notification.insertMany([
            {
              userId,
              title: '94% Cognitive & Sensory Match Found',
              message: 'Fintech Logic Corp and 4 other verified inclusive employers match your work-style preferences.',
              type: 'JOB_MATCH_FOUND',
              linkUrl: '/candidate/jobs',
              read: false,
            },
            {
              userId,
              title: '48-Hour Advance Interview Packet Ready',
              message: 'Preview your upcoming structured session agenda, confirmed accommodations, and advance questions.',
              type: 'INTERVIEW_SCHEDULED',
              linkUrl: '/candidate/interviews',
              read: false,
            },
            {
              userId,
              title: 'Multi-Level Course Skill Quizzes Unlocked',
              message: 'Earn verified Beginner, Intermediate, and Advanced skill badges in the Assessment & Quiz Hub.',
              type: 'SYSTEM_ANNOUNCEMENT',
              linkUrl: '/candidate/results',
              read: false,
            },
          ]);
        }

        notifications = await Notification.find({ userId })
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();
      }

      const unreadCount = await Notification.countDocuments({ userId, read: false });

      res.json({ success: true, notifications, unreadCount });
    } catch (err: any) {
      console.error('getNotifications error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
    }
  }

  public static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const notification = await Notification.findOneAndUpdate(
        { _id: id, userId: req.user?.userId },
        { $set: { read: true } },
        { new: true }
      );

      res.json({ success: true, notification });
    } catch (err: any) {
      console.error('markAsRead error:', err);
      res.status(500).json({ success: false, message: 'Failed to update notification.' });
    }
  }

  public static async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      await Notification.updateMany({ userId: req.user?.userId }, { $set: { read: true } });
      res.json({ success: true, message: 'All notifications marked as read.' });
    } catch (err: any) {
      console.error('markAllAsRead error:', err);
      res.status(500).json({ success: false, message: 'Failed to mark all as read.' });
    }
  }
}
