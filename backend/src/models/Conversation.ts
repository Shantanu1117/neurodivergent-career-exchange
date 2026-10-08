import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[]; // ref User
  jobId?: mongoose.Types.ObjectId; // ref Job
  lastMessageText: string;
  lastMessageAt: Date;
  unreadCountByUser: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
    lastMessageText: { type: String, default: '' },
    lastMessageAt: { type: Date, default: Date.now },
    unreadCountByUser: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
