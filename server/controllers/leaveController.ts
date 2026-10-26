import { Request, Response, NextFunction } from 'express';
import { LeaveRequest } from '../models/LeaveRequest.ts';

export const applyLeave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      res.status(400).json({ message: 'All leave request fields are required.' });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      res.status(400).json({ message: 'End date cannot be earlier than start date.' });
      return;
    }

    // Calculate days count inclusive
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leaveRequest = await LeaveRequest.create({
      user: user.userId,
      employeeCode: user.employeeId,
      employeeName: user.name,
      leaveType,
      startDate,
      endDate,
      daysCount,
      reason,
      status: 'Pending',
    });

    res.status(201).json({
      message: 'Leave application submitted successfully.',
      leaveRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyLeaves = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    const requests = await LeaveRequest.find({ user: user.userId }).sort({ createdAt: -1 });

    res.json({
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllLeaves = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, leaveType } = req.query;

    const filter: any = {};
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (leaveType && leaveType !== 'All') {
      filter.leaveType = leaveType;
    }

    const requests = await LeaveRequest.find(filter).sort({ createdAt: -1 });

    res.json({
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLeaveStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;
    const reviewer = req.user!;

    if (!['Approved', 'Rejected'].includes(status)) {
      res.status(400).json({ message: 'Status must be either Approved or Rejected.' });
      return;
    }

    const request = await LeaveRequest.findById(id);
    if (!request) {
      res.status(404).json({ message: 'Leave request not found.' });
      return;
    }

    request.status = status;
    request.reviewedBy = reviewer.userId as any;
    request.reviewedByName = reviewer.name;
    request.reviewNotes = reviewNotes || '';
    request.reviewedAt = new Date();

    await request.save();

    res.json({
      message: `Leave request has been ${status.toLowerCase()} successfully.`,
      leaveRequest: request,
    });
  } catch (error) {
    next(error);
  }
};
