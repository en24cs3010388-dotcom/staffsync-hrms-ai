import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB, getDbStatus } from './server/config/db.ts';
import { seedDatabase } from './server/config/seed.ts';
import { User } from './server/models/User.ts';

// Routes
import authRoutes from './server/routes/authRoutes.ts';
import employeeRoutes from './server/routes/employeeRoutes.ts';
import attendanceRoutes from './server/routes/attendanceRoutes.ts';
import leaveRoutes from './server/routes/leaveRoutes.ts';
import announcementRoutes from './server/routes/announcementRoutes.ts';
import trainingRoutes from './server/routes/trainingRoutes.ts';
import dashboardRoutes from './server/routes/dashboardRoutes.ts';
import { errorHandler } from './server/middleware/errorHandler.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Dev server must strictly run on port 3000 in AI Studio
const PORT = 3000;

app.use(cors());
app.use(express.json());

// API health check with database status
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    system: 'StaffSync HRMS API',
    database: getDbStatus(),
    timestamp: new Date().toISOString(),
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Centralized error handling
app.use(errorHandler);

// Vite middleware in dev or static files in production
async function startServer() {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction) {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      app.use(express.static(path.resolve(__dirname, 'dist')));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
      });
    }

    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`StaffSync HRMS Server listening on http://0.0.0.0:${PORT}`);
    });

    // Initialize database connection
    await connectDB();
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('No users found in database. Auto-seeding initial demo data...');
      await seedDatabase();
    }
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
}

startServer();
