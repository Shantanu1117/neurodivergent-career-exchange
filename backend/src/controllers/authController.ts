import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User.js';
import { CandidateProfile } from '../models/CandidateProfile.js';
import { EmployerProfile } from '../models/EmployerProfile.js';

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, role, fullName, companyName, location } = req.body;

      if (!email || !password || !role) {
        res.status(400).json({ success: false, message: 'Email, password, and role are required.' });
        return;
      }

      if (!['CANDIDATE', 'EMPLOYER'].includes(role)) {
        res.status(400).json({ success: false, message: 'Role must be CANDIDATE or EMPLOYER.' });
        return;
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await User.create({
        email: email.toLowerCase(),
        passwordHash,
        role: role as UserRole,
      });

      let profileData: any = null;

      if (role === 'CANDIDATE') {
        profileData = await CandidateProfile.create({
          userId: user._id,
          fullName: fullName || email.split('@')[0],
          location: location || 'Remote',
          strengths: ['Attention to Detail', 'Pattern Recognition', 'Deep Focus'],
          skills: ['Quality Assurance', 'Analytical Thinking', 'Testing'],
          accommodations: ['Written instructions', 'Flexible working hours', 'Reduced unnecessary meetings'],
        });
      } else if (role === 'EMPLOYER') {
        profileData = await EmployerProfile.create({
          userId: user._id,
          companyName: companyName || `${email.split('@')[0]} Enterprises`,
          location: location || 'Remote / Hybrid',
          accommodationsOffered: [
            'Written instructions standard',
            'Quiet focus rooms',
            'Flexible core hours',
            'Camera-optional meetings',
          ],
        });
      }

      const secret = process.env.JWT_SECRET || 'super_secure_jwt_secret_ndce_2026_key';
      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email, role: user.role },
        secret,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        profile: profileData,
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required.' });
        return;
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      let profile: any = null;
      if (user.role === 'CANDIDATE') {
        profile = await CandidateProfile.findOne({ userId: user._id });
      } else if (user.role === 'EMPLOYER') {
        profile = await EmployerProfile.findOne({ userId: user._id });
      }

      const secret = process.env.JWT_SECRET || 'super_secure_jwt_secret_ndce_2026_key';
      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email, role: user.role },
        secret,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        profile,
      });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ success: false, message: 'Server error during login.' });
    }
  }

  public static async getMe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated.' });
        return;
      }

      const user = await User.findById(req.user.userId).select('-passwordHash');
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      let profile: any = null;
      if (user.role === 'CANDIDATE') {
        profile = await CandidateProfile.findOne({ userId: user._id });
      } else if (user.role === 'EMPLOYER') {
        profile = await EmployerProfile.findOne({ userId: user._id });
      }

      res.json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        profile,
      });
    } catch (err: any) {
      console.error('GetMe error:', err);
      res.status(500).json({ success: false, message: 'Server error retrieving current session.' });
    }
  }

  public static async logout(req: Request, res: Response): Promise<void> {
    res.json({ success: true, message: 'Logged out successfully.' });
  }
}
