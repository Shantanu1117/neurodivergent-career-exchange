import { Request, Response } from 'express';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';

export class MessageController {
  public static async getConversations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const conversations = await Conversation.find({ participants: userId })
        .populate('participants', 'email role')
        .populate('jobId', 'title')
        .sort({ lastMessageAt: -1 })
        .lean();

      res.json({ success: true, conversations });
    } catch (err: any) {
      console.error('getConversations error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve conversations.' });
    }
  }

  public static async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const userId = req.user?.userId;

      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
      });

      if (!conversation) {
        res.status(404).json({ success: false, message: 'Conversation not found.' });
        return;
      }

      const messages = await Message.find({ conversationId }).sort({ createdAt: 1 }).lean();

      // Mark messages as read by current user
      await Message.updateMany(
        { conversationId, readBy: { $ne: userId } },
        { $addToSet: { readBy: userId } }
      );

      res.json({ success: true, messages });
    } catch (err: any) {
      console.error('getMessages error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve messages.' });
    }
  }

  public static async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { recipientId, content, jobId, conversationId } = req.body;
      const senderId = req.user?.userId;

      if (!content || !content.trim()) {
        res.status(400).json({ success: false, message: 'Message content is required.' });
        return;
      }

      let conv;
      if (conversationId) {
        conv = await Conversation.findById(conversationId);
      } else if (recipientId) {
        conv = await Conversation.findOne({
          participants: { $all: [senderId, recipientId] },
        });

        if (!conv) {
          conv = await Conversation.create({
            participants: [senderId, recipientId],
            jobId: jobId || undefined,
            lastMessageText: content.trim(),
            lastMessageAt: new Date(),
          });
        }
      }

      if (!conv) {
        res.status(400).json({ success: false, message: 'Valid recipient or conversation is required.' });
        return;
      }

      const message = await Message.create({
        conversationId: conv._id,
        senderId,
        content: content.trim(),
        readBy: [senderId],
      });

      conv.lastMessageText = content.trim();
      conv.lastMessageAt = new Date();
      await conv.save();

      // Notify other participants
      const otherParticipants = conv.participants.filter(
        (p: any) => p.toString() !== senderId?.toString()
      );

      for (const pId of otherParticipants) {
        await Notification.create({
          userId: pId,
          title: 'New Message',
          message: content.length > 60 ? content.substring(0, 57) + '...' : content,
          type: 'MESSAGE_RECEIVED',
          linkUrl: `/candidate/messages?id=${conv._id}`,
        });
      }

      res.status(201).json({ success: true, message });
    } catch (err: any) {
      console.error('sendMessage error:', err);
      res.status(500).json({ success: false, message: 'Failed to send message.' });
    }
  }
}
