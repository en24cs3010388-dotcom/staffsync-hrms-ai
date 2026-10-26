import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDbStatus } from './config/db.ts';
import { seedDatabase } from './config/seed.ts';
import { User } from './models/User.ts';

// Routes
import authRoutes from './routes/authRoutes.ts';
import employeeRoutes from './routes/employeeRoutes.ts';
import attendanceRoutes from './routes/attendanceRoutes.ts';
import leaveRoutes from './routes/leaveRoutes.ts';
import announcementRoutes from './routes/announcementRoutes.ts';
import trainingRoutes from './routes/trainingRoutes.ts';
import dashboardRoutes from './routes/dashboardRoutes.ts';
import { errorHandler } from './middleware/errorHandler.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    system: 'StaffSync HRMS API Server',
    database: getDbStatus(),
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Centralized error handling
app.use(errorHandler);

async function startServer() {
  try {
    await connectDB();
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database empty. Auto-seeding initial demo data...');
      await seedDatabase();
    }

    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`StaffSync HRMS Server listening on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
}

startServer();
