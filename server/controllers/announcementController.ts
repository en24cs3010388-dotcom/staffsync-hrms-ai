import { Request, Response, NextFunction } from 'express';
import { Announcement } from '../models/Announcement.ts';

export const getAnnouncements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const isHR = req.user?.role === 'HR Admin';
    const { category, status } = req.query;

    const filter: any = {};

    // Non-HR users can only see Published announcements
    if (!isHR) {
      filter.status = 'Published';
    } else if (status && status !== 'All') {
      filter.status = status;
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    const announcements = await Announcement.find(filter).sort({ publishDate: -1, createdAt: -1 });

    res.json({
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    const { title, content, category, priority } = req.body;

    if (!title || !content) {
      res.status(400).json({ message: 'Title and content are required.' });
      return;
    }

    const announcement = await Announcement.create({
      title,
      content,
      category: category || 'General',
      priority: priority || 'Medium',
      author: user.userId,
      authorName: user.name,
      status: 'Published',
      publishDate: new Date(),
    });

    res.status(201).json({
      message: 'Announcement published successfully.',
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content, category, priority, status } = req.body;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      res.status(404).json({ message: 'Announcement not found.' });
      return;
    }

    if (title) announcement.title = title;
    if (content) announcement.content = content;
    if (category) announcement.category = category;
    if (priority) announcement.priority = priority;
    if (status) announcement.status = status;

    await announcement.save();

    res.json({
      message: 'Announcement updated successfully.',
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleArchiveAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id);

    if (!announcement) {
      res.status(404).json({ message: 'Announcement not found.' });
      return;
    }

    const nextStatus = announcement.status === 'Published' ? 'Archived' : 'Published';
    announcement.status = nextStatus;
    await announcement.save();

    res.json({
      message: `Announcement marked as ${nextStatus}.`,
      announcement,
    });
  } catch (error) {
    next(error);
  }
};
