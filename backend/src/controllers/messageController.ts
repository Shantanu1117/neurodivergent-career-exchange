import { Request, Response } from 'express';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Notification } from '../models/Notification.js';
import { EmployerProfile } from '../models/EmployerProfile.js';
import { CandidateProfile } from '../models/CandidateProfile.js';
import { Job } from '../models/Job.js';

export class MessageController {
  private static async enrichConversationsForUser(rawConversations: any[], currentUserId: string) {
    const enriched = await Promise.all(
      rawConversations.map(async (conv) => {
        const otherParticipant = (conv.participants || []).find(
          (p: any) => String(p._id || p) !== String(currentUserId)
        );
        const otherUserId = otherParticipant?._id || otherParticipant;

        let partnerName = 'Inclusive Hiring Team';
        let partnerSubtitle = 'Verified Neuro-Inclusive Partner';
        let partnerRole = otherParticipant?.role || 'EMPLOYER';
        let partnerAccommodations: string[] = [];

        if (otherUserId) {
          const empProfile = await EmployerProfile.findOne({ userId: otherUserId }).lean();
          if (empProfile) {
            partnerName = empProfile.companyName;
            partnerSubtitle = `${empProfile.industry || 'Technology'} • ${empProfile.location || 'Remote'}`;
            partnerRole = 'EMPLOYER';
            partnerAccommodations = (empProfile.accommodationsOffered || []).slice(0, 3);
          } else {
            const candProfile = await CandidateProfile.findOne({ userId: otherUserId }).lean();
            if (candProfile) {
              partnerName = candProfile.fullName;
              partnerSubtitle = candProfile.headline || 'Neurodivergent Candidate';
              partnerRole = 'CANDIDATE';
              partnerAccommodations = (candProfile.accommodations || []).slice(0, 3);
            }
          }
        }

        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          readBy: { $ne: currentUserId },
        });

        return {
          ...conv,
          partnerInfo: {
            userId: otherUserId,
            name: partnerName,
            subtitle: partnerSubtitle,
            role: partnerRole,
            accommodations: partnerAccommodations,
          },
          unreadCount,
        };
      })
    );

    return enriched;
  }

  public static async getConversations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      let conversations = await Conversation.find({ participants: userId })
        .populate('participants', 'email role')
        .populate('jobId', 'title workMode location')
        .sort({ lastMessageAt: -1 })
        .lean();

      // Auto-initialize helpful starter threads if a candidate has 0 conversations
      if (conversations.length === 0 && req.user?.role === 'CANDIDATE') {
        const employers = await EmployerProfile.find().limit(2).lean();
        for (let i = 0; i < employers.length; i++) {
          const emp = employers[i];
          if (!emp.userId || String(emp.userId) === String(userId)) continue;

          const sampleJob = await Job.findOne({ employerId: emp._id, status: 'PUBLISHED' }).lean();
          const welcomeText =
            i === 0
              ? `Welcome to the Neurodivergent Career Exchange! I'm the Inclusive Hiring Lead at ${emp.companyName}. For our ${sampleJob?.title || 'engineering & QA'} roles, we share all interview questions 48 hours in advance and support written/async communication. Feel free to ask any questions about workplace accommodations or role expectations here!`
              : `Hi there! I'm with the Workplace Adjustments & Talent Desk at ${emp.companyName}. You can use this asynchronous thread anytime to share your "How I Work Best" preferences or ask about our practical work-sample option (no live whiteboard stress!).`;

          const createdConv = await Conversation.create({
            participants: [userId, emp.userId],
            jobId: sampleJob?._id,
            lastMessageText: welcomeText,
            lastMessageAt: new Date(Date.now() - i * 60000),
          });

          await Message.create({
            conversationId: createdConv._id,
            senderId: emp.userId,
            content: welcomeText,
            readBy: [emp.userId, userId],
          });
        }

        conversations = await Conversation.find({ participants: userId })
          .populate('participants', 'email role')
          .populate('jobId', 'title workMode location')
          .sort({ lastMessageAt: -1 })
          .lean();
      }

      const enriched = await MessageController.enrichConversationsForUser(conversations, userId);
      res.json({ success: true, conversations: enriched });
    } catch (err: any) {
      console.error('getConversations error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve conversations.' });
    }
  }

  public static async getContacts(req: Request, res: Response): Promise<void> {
    try {
      const role = req.user?.role;
      if (role === 'EMPLOYER') {
        const candidates = await CandidateProfile.find().limit(15).lean();
        const contacts = candidates.map((c) => ({
          userId: c.userId,
          name: c.fullName,
          subtitle: c.headline || 'Candidate',
          location: c.location || 'Remote',
          tags: (c.strengths || []).slice(0, 3),
          role: 'CANDIDATE',
        }));
        res.json({ success: true, contacts });
        return;
      }

      // Default: return verified employers & their featured open jobs for Candidates
      const employers = await EmployerProfile.find().lean();
      const contacts = await Promise.all(
        employers.map(async (emp) => {
          const jobs = await Job.find({ employerId: emp._id, status: 'PUBLISHED' })
            .select('_id title workMode')
            .limit(3)
            .lean();
          return {
            userId: emp.userId,
            employerProfileId: emp._id,
            name: emp.companyName,
            subtitle: `${emp.industry} • ${emp.location}`,
            tags: (emp.accommodationsOffered || []).slice(0, 3),
            jobs,
            role: 'EMPLOYER',
          };
        })
      );

      res.json({ success: true, contacts });
    } catch (err: any) {
      console.error('getContacts error:', err);
      res.status(500).json({ success: false, message: 'Failed to load messaging directory.' });
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

      let conv: any = null;
      if (conversationId) {
        conv = await Conversation.findById(conversationId);
      } else if (recipientId) {
        const query: any = {
          participants: { $all: [senderId, recipientId] },
        };
        if (jobId) {
          query.jobId = jobId;
        }
        conv = await Conversation.findOne(query);

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

      // If a Candidate messages an Employer, provide an intelligent asynchronous hiring team reply
      let autoReplyMessage: any = null;
      if (req.user?.role === 'CANDIDATE' && otherParticipants.length > 0) {
        const partnerUserId = otherParticipants[0];
        const empProfile = await EmployerProfile.findOne({ userId: partnerUserId }).lean();
        if (empProfile) {
          const lower = content.toLowerCase();
          let replyText = `Thank you for reaching out to ${empProfile.companyName}! We have logged your message in our asynchronous hiring queue. Our inclusive recruiting lead will review your note alongside your Strengths & "How I Work Best" profile—no surprise phone calls.`;

          if (lower.includes('accommodation') || lower.includes('work best') || lower.includes('quiet') || lower.includes('sensory')) {
            replyText = `Thank you for sharing your accommodation preferences with ${empProfile.companyName}! We pre-approve adjustments including ${(empProfile.accommodationsOffered || ['Written instructions', 'Quiet focus blocks', 'Camera-optional calls']).slice(0, 3).join(', ')} from Day 1 without requiring medical disclosure.`;
          } else if (lower.includes('interview') || lower.includes('question') || lower.includes('agenda')) {
            replyText = `Great question! At ${empProfile.companyName}, we send the written interview agenda and all technical questions 48 hours in advance. You can also opt for a practical asynchronous work-sample walkthrough instead of live whiteboard coding.`;
          } else if (lower.includes('apply') || lower.includes('role') || lower.includes('skill') || lower.includes('job')) {
            replyText = `We would love to review your application at ${empProfile.companyName}! Remember that you only need to meet the Essential "Must-Have" skills to apply—any "Nice-to-Have" tools can be learned on the job with structured documentation.`;
          }

          autoReplyMessage = await Message.create({
            conversationId: conv._id,
            senderId: partnerUserId,
            content: replyText,
            readBy: [partnerUserId, senderId],
            createdAt: new Date(Date.now() + 500),
          });

          conv.lastMessageText = replyText;
          conv.lastMessageAt = new Date(Date.now() + 500);
          await conv.save();
        }
      }

      res.status(201).json({
        success: true,
        conversationId: conv._id,
        message,
        autoReplyMessage,
      });
    } catch (err: any) {
      console.error('sendMessage error:', err);
      res.status(500).json({ success: false, message: 'Failed to send message.' });
    }
  }
}
