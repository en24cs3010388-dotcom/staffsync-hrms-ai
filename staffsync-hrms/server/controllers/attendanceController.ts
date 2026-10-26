import { Request, Response, NextFunction } from 'express';
import { Attendance } from '../models/Attendance.ts';

// Helper to get today's date formatted as YYYY-MM-DD in local time
const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const checkIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    const today = getTodayDateString();

    let record = await Attendance.findOne({ user: user.userId, date: today });

    if (record && record.checkIn) {
      res.status(400).json({
        message: 'You have already checked in for today.',
        attendance: record,
      });
      return;
    }

    const checkInTime = new Date();

    if (!record) {
      record = await Attendance.create({
        user: user.userId,
        employeeCode: user.employeeId,
        employeeName: user.name,
        date: today,
        checkIn: checkInTime,
        status: 'Present',
        workHours: 0,
      });
    } else {
      record.checkIn = checkInTime;
      record.status = 'Present';
      await record.save();
    }

    res.status(200).json({
      message: 'Check-in successful. Have a productive day!',
      attendance: record,
    });
  } catch (error) {
    next(error);
  }
};

export const checkOut = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    const today = getTodayDateString();

    const record = await Attendance.findOne({ user: user.userId, date: today });

    if (!record || !record.checkIn) {
      res.status(400).json({
        message: 'You have not checked in for today yet.',
      });
      return;
    }

    if (record.checkOut) {
      res.status(400).json({
        message: 'You have already checked out for today.',
        attendance: record,
      });
      return;
    }

    const checkOutTime = new Date();
    const diffMs = checkOutTime.getTime() - new Date(record.checkIn).getTime();
    const hours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10; // rounded to 1 decimal

    record.checkOut = checkOutTime;
    record.workHours = hours;

    if (hours < 4) {
      record.status = 'Half-day';
    } else {
      record.status = 'Present';
    }

    await record.save();

    res.status(200).json({
      message: `Check-out successful. Total hours worked: ${hours} hrs.`,
      attendance: record,
    });
  } catch (error) {
    next(error);
  }
};

export const getTodayStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    const today = getTodayDateString();

    const record = await Attendance.findOne({ user: user.userId, date: today });

    res.json({
      date: today,
      hasCheckedIn: !!record?.checkIn,
      hasCheckedOut: !!record?.checkOut,
      attendance: record || null,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAttendanceHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    const records = await Attendance.find({ user: user.userId }).sort({ date: -1 }).limit(60);

    res.json({
      count: records.length,
      records,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAttendanceRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { date, search, status } = req.query;

    const filter: any = {};

    if (date && typeof date === 'string') {
      filter.date = date;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { employeeName: searchRegex },
        { employeeCode: searchRegex },
      ];
    }

    const records = await Attendance.find(filter).sort({ date: -1, createdAt: -1 }).limit(100);

    res.json({
      count: records.length,
      records,
    });
  } catch (error) {
    next(error);
  }
};
