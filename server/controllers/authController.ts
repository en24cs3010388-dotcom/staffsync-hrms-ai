import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.ts';
import { Employee } from '../models/Employee.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'staffsync_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = '7d';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // Find user with password included
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    if (user.status === 'Inactive') {
      res.status(403).json({ message: 'Account is deactivated. Please contact your HR administrator.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Fetch employee details if linked
    const employee = await Employee.findOne({
      $or: [{ user: user._id }, { email: user.email }, { employeeCode: user.employeeId }],
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        status: user.status,
        department: employee?.department || (user.role === 'HR Admin' ? 'Human Resources' : 'Management'),
        position: employee?.position || user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const employee = await Employee.findOne({
      $or: [{ user: user._id }, { email: user.email }, { employeeCode: user.employeeId }],
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        status: user.status,
        department: employee?.department || (user.role === 'HR Admin' ? 'Human Resources' : 'General'),
        position: employee?.position || user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.json({ message: 'Logged out successfully' });
};
