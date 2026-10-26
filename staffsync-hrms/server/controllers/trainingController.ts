import { Request, Response, NextFunction } from 'express';
import { Training } from '../models/Training.ts';
import { TrainingEnrollment } from '../models/TrainingEnrollment.ts';
import { Employee } from '../models/Employee.ts';

export const getTrainings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    const { status, department } = req.query;

    const filter: any = {};
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (department && department !== 'All') {
      filter.department = { $in: [department, 'All Departments'] };
    }

    const trainings = await Training.find(filter).sort({ startDate: 1 });

    // Fetch current user's enrollments to flag them
    const myEnrollments = await TrainingEnrollment.find({ user: user.userId });
    const enrolledTrainingIds = new Set(myEnrollments.map(e => e.training.toString()));

    const result = trainings.map(t => {
      const obj = t.toObject();
      return {
        ...obj,
        isEnrolled: enrolledTrainingIds.has(t._id.toString()),
      };
    });

    res.json({
      count: result.length,
      trainings: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createTraining = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    const { title, description, trainer, department, startDate, endDate, capacity } = req.body;

    if (!title || !description || !trainer || !startDate || !endDate || !capacity) {
      res.status(400).json({ message: 'All training fields are required.' });
      return;
    }

    const training = await Training.create({
      title,
      description,
      trainer,
      department: department || 'All Departments',
      startDate,
      endDate,
      capacity: Number(capacity),
      enrolledCount: 0,
      status: 'Upcoming',
      createdBy: user.userId,
    });

    res.status(201).json({
      message: 'Training program created successfully.',
      training,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTraining = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, trainer, department, startDate, endDate, capacity, status } = req.body;

    const training = await Training.findById(id);
    if (!training) {
      res.status(404).json({ message: 'Training program not found.' });
      return;
    }

    if (title) training.title = title;
    if (description) training.description = description;
    if (trainer) training.trainer = trainer;
    if (department) training.department = department;
    if (startDate) training.startDate = startDate;
    if (endDate) training.endDate = endDate;
    if (capacity !== undefined) training.capacity = Number(capacity);
    if (status) training.status = status;

    await training.save();

    res.json({
      message: 'Training program updated successfully.',
      training,
    });
  } catch (error) {
    next(error);
  }
};

export const enrollInTraining = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const training = await Training.findById(id);
    if (!training) {
      res.status(404).json({ message: 'Training program not found.' });
      return;
    }

    if (training.status === 'Completed' || training.status === 'Cancelled') {
      res.status(400).json({ message: `Cannot enroll in a training program that is ${training.status.toLowerCase()}.` });
      return;
    }

    // Check capacity
    if (training.enrolledCount >= training.capacity) {
      res.status(400).json({ message: 'This training session has reached full capacity.' });
      return;
    }

    // Check existing enrollment
    const existing = await TrainingEnrollment.findOne({
      training: training._id,
      user: user.userId,
    });

    if (existing) {
      res.status(400).json({ message: 'You are already enrolled in this training program.' });
      return;
    }

    // Get employee details
    const employee = await Employee.findOne({
      $or: [{ user: user.userId }, { email: user.email }, { employeeCode: user.employeeId }],
    });

    const enrollment = await TrainingEnrollment.create({
      training: training._id,
      user: user.userId,
      employeeCode: user.employeeId,
      employeeName: user.name,
      department: employee?.department || 'General',
      enrollmentDate: new Date(),
      status: 'Enrolled',
    });

    // Increment enrolled count
    training.enrolledCount += 1;
    await training.save();

    res.status(201).json({
      message: 'Enrolled in training program successfully!',
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

export const getParticipants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const training = await Training.findById(id);
    if (!training) {
      res.status(404).json({ message: 'Training program not found.' });
      return;
    }

    const enrollments = await TrainingEnrollment.find({ training: id }).sort({ enrollmentDate: -1 });

    res.json({
      training: {
        id: training._id,
        title: training.title,
        capacity: training.capacity,
        enrolledCount: training.enrolledCount,
      },
      count: enrollments.length,
      participants: enrollments,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyEnrollments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    const enrollments = await TrainingEnrollment.find({ user: user.userId })
      .populate('training')
      .sort({ enrollmentDate: -1 });

    res.json({
      count: enrollments.length,
      enrollments,
    });
  } catch (error) {
    next(error);
  }
};
