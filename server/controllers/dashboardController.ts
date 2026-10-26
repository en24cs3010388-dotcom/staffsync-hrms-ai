import { Request, Response, NextFunction } from 'express';
import { Employee } from '../models/Employee.ts';
import { Attendance } from '../models/Attendance.ts';
import { LeaveRequest } from '../models/LeaveRequest.ts';
import { Training } from '../models/Training.ts';
import { Announcement } from '../models/Announcement.ts';
import { TrainingEnrollment } from '../models/TrainingEnrollment.ts';

const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    const today = getTodayDateString();

    // System-wide counts
    const totalEmployees = await Employee.countDocuments({ status: 'Active' });
    const todayAttendanceCount = await Attendance.countDocuments({ date: today, checkIn: { $exists: true } });
    const pendingLeavesCount = await LeaveRequest.countDocuments({ status: 'Pending' });
    const upcomingTrainingsCount = await Training.countDocuments({ status: 'Upcoming' });

    // User personal status
    const todayUserAttendance = await Attendance.findOne({ user: user.userId, date: today });
    const myPendingLeavesCount = await LeaveRequest.countDocuments({ user: user.userId, status: 'Pending' });
    const myEnrollmentsCount = await TrainingEnrollment.countDocuments({ user: user.userId });

    // Recent announcements
    const recentAnnouncements = await Announcement.find({ status: 'Published' })
      .sort({ publishDate: -1 })
      .limit(3);

    // Recent upcoming trainings
    const upcomingTrainingsList = await Training.find({ status: 'Upcoming' })
      .sort({ startDate: 1 })
      .limit(3);

    res.json({
      stats: {
        totalEmployees,
        todayAttendanceCount,
        pendingLeavesCount,
        upcomingTrainingsCount,
        userAttendance: {
          hasCheckedIn: !!todayUserAttendance?.checkIn,
          hasCheckedOut: !!todayUserAttendance?.checkOut,
          checkIn: todayUserAttendance?.checkIn || null,
          checkOut: todayUserAttendance?.checkOut || null,
          workHours: todayUserAttendance?.workHours || 0,
        },
        myPendingLeavesCount,
        myEnrollmentsCount,
      },
      recentAnnouncements,
      upcomingTrainings: upcomingTrainingsList,
    });
  } catch (error) {
    next(error);
  }
};
