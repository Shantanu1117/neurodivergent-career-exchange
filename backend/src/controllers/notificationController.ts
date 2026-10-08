import { Request, Response } from 'express';
import { Notification } from '../models/Notification.js';

export class NotificationController {
  public static async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

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
