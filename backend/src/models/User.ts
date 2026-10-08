import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['CANDIDATE', 'EMPLOYER', 'ADMIN'],
      required: true,
      default: 'CANDIDATE',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
