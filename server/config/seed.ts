import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from './db.ts';
import { User } from '../models/User.ts';
import { Employee } from '../models/Employee.ts';
import { Attendance } from '../models/Attendance.ts';
import { LeaveRequest } from '../models/LeaveRequest.ts';
import { Announcement } from '../models/Announcement.ts';
import { Training } from '../models/Training.ts';
import { TrainingEnrollment } from '../models/TrainingEnrollment.ts';

export const seedDatabase = async () => {
  try {
    console.log('--- Starting StaffSync Database Seeding ---');

    // Clear existing collections
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    await LeaveRequest.deleteMany({});
    await Announcement.deleteMany({});
    await Training.deleteMany({});
    await TrainingEnrollment.deleteMany({});

    console.log('Cleared existing records.');

    const defaultPassword = 'Password123!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // 1. Create Core Demo Users
    const adminUser = await User.create({
      name: 'Sarah Jenkins',
      email: 'admin@staffsync.com',
      password: hashedPassword,
      role: 'HR Admin',
      employeeId: 'ADM001',
      status: 'Active',
    });

    const managerUser = await User.create({
      name: 'Michael Chang',
      email: 'manager@staffsync.com',
      password: hashedPassword,
      role: 'Manager',
      employeeId: 'MGR001',
      status: 'Active',
    });

    const employeeUser = await User.create({
      name: 'Alex Rivera',
      email: 'employee@staffsync.com',
      password: hashedPassword,
      role: 'Employee',
      employeeId: 'EMP001',
      status: 'Active',
    });

    const employeeUser2 = await User.create({
      name: 'Emily Watson',
      email: 'emily.watson@staffsync.com',
      password: hashedPassword,
      role: 'Employee',
      employeeId: 'EMP002',
      status: 'Active',
    });

    const employeeUser3 = await User.create({
      name: 'David Kim',
      email: 'david.kim@staffsync.com',
      password: hashedPassword,
      role: 'Employee',
      employeeId: 'EMP003',
      status: 'Active',
    });

    console.log('Seeded Users: HR Admin, Manager, and Employees.');

    // 2. Create Employee Directory Profiles
    await Employee.create([
      {
        user: adminUser._id,
        employeeCode: 'ADM001',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        email: 'admin@staffsync.com',
        phone: '+1 (555) 234-5678',
        department: 'Human Resources',
        position: 'Head of People & Culture',
        dateOfJoining: new Date('2021-03-15'),
        salary: 95000,
        status: 'Active',
        address: '742 Evergreen Terrace, Springfield',
        emergencyContact: {
          name: 'Robert Jenkins',
          relationship: 'Spouse',
          phone: '+1 (555) 987-6543',
        },
      },
      {
        user: managerUser._id,
        employeeCode: 'MGR001',
        firstName: 'Michael',
        lastName: 'Chang',
        email: 'manager@staffsync.com',
        phone: '+1 (555) 345-6789',
        department: 'Engineering',
        position: 'Engineering Lead',
        dateOfJoining: new Date('2022-01-10'),
        salary: 110000,
        status: 'Active',
        address: '10880 Wilshire Blvd, Los Angeles',
        emergencyContact: {
          name: 'Linda Chang',
          relationship: 'Sister',
          phone: '+1 (555) 876-5432',
        },
      },
      {
        user: employeeUser._id,
        employeeCode: 'EMP001',
        firstName: 'Alex',
        lastName: 'Rivera',
        email: 'employee@staffsync.com',
        phone: '+1 (555) 456-7890',
        department: 'Engineering',
        position: 'Full-Stack Software Engineer',
        dateOfJoining: new Date('2023-06-01'),
        salary: 82000,
        status: 'Active',
        address: '450 Mission St, San Francisco',
        emergencyContact: {
          name: 'Maria Rivera',
          relationship: 'Mother',
          phone: '+1 (555) 765-4321',
        },
      },
      {
        user: employeeUser2._id,
        employeeCode: 'EMP002',
        firstName: 'Emily',
        lastName: 'Watson',
        email: 'emily.watson@staffsync.com',
        phone: '+1 (555) 567-8901',
        department: 'Marketing',
        position: 'Digital Marketing Strategist',
        dateOfJoining: new Date('2023-09-15'),
        salary: 74000,
        status: 'Active',
        address: '120 Broadway, New York',
        emergencyContact: {
          name: 'James Watson',
          relationship: 'Brother',
          phone: '+1 (555) 654-3210',
        },
      },
      {
        user: employeeUser3._id,
        employeeCode: 'EMP003',
        firstName: 'David',
        lastName: 'Kim',
        email: 'david.kim@staffsync.com',
        phone: '+1 (555) 678-9012',
        department: 'Finance',
        position: 'Financial Analyst',
        dateOfJoining: new Date('2024-02-01'),
        salary: 78000,
        status: 'Active',
        address: '300 S Wacker Dr, Chicago',
        emergencyContact: {
          name: 'Grace Kim',
          relationship: 'Spouse',
          phone: '+1 (555) 543-2109',
        },
      },
      {
        employeeCode: 'EMP004',
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'priya.sharma@staffsync.com',
        phone: '+1 (555) 789-0123',
        department: 'Operations',
        position: 'Operations Coordinator',
        dateOfJoining: new Date('2024-04-12'),
        salary: 68000,
        status: 'Active',
        address: '500 Pine St, Seattle',
        emergencyContact: {
          name: 'Raj Sharma',
          relationship: 'Father',
          phone: '+1 (555) 432-1098',
        },
      },
      {
        employeeCode: 'EMP005',
        firstName: 'Marcus',
        lastName: 'Vance',
        email: 'marcus.vance@staffsync.com',
        phone: '+1 (555) 890-1234',
        department: 'Sales',
        position: 'Account Executive',
        dateOfJoining: new Date('2022-11-20'),
        salary: 88000,
        status: 'Inactive',
        address: '800 Brickell Ave, Miami',
        emergencyContact: {
          name: 'Chloe Vance',
          relationship: 'Partner',
          phone: '+1 (555) 321-0987',
        },
      },
    ]);

    console.log('Seeded Employees directory records.');

    // 3. Create Sample Attendance History for Alex (EMP001) & Others
    const today = new Date();
    const formatDate = (daysAgo: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Past 3 days attendance
    await Attendance.create([
      {
        user: employeeUser._id,
        employeeCode: 'EMP001',
        employeeName: 'Alex Rivera',
        date: formatDate(1),
        checkIn: new Date(new Date().setHours(9, 2, 0, 0) - 24 * 3600 * 1000),
        checkOut: new Date(new Date().setHours(17, 30, 0, 0) - 24 * 3600 * 1000),
        status: 'Present',
        workHours: 8.5,
        notes: 'Completed sprint tickets and code reviews.',
      },
      {
        user: employeeUser._id,
        employeeCode: 'EMP001',
        employeeName: 'Alex Rivera',
        date: formatDate(2),
        checkIn: new Date(new Date().setHours(9, 15, 0, 0) - 48 * 3600 * 1000),
        checkOut: new Date(new Date().setHours(18, 0, 0, 0) - 48 * 3600 * 1000),
        status: 'Present',
        workHours: 8.7,
        notes: 'API architecture meeting and implementation.',
      },
      {
        user: managerUser._id,
        employeeCode: 'MGR001',
        employeeName: 'Michael Chang',
        date: formatDate(1),
        checkIn: new Date(new Date().setHours(8, 45, 0, 0) - 24 * 3600 * 1000),
        checkOut: new Date(new Date().setHours(17, 45, 0, 0) - 24 * 3600 * 1000),
        status: 'Present',
        workHours: 9.0,
      },
      {
        user: employeeUser2._id,
        employeeCode: 'EMP002',
        employeeName: 'Emily Watson',
        date: formatDate(1),
        checkIn: new Date(new Date().setHours(9, 30, 0, 0) - 24 * 3600 * 1000),
        checkOut: new Date(new Date().setHours(14, 0, 0, 0) - 24 * 3600 * 1000),
        status: 'Half-day',
        workHours: 4.5,
        notes: 'Left early for doctor appointment.',
      },
    ]);

    console.log('Seeded Attendance records.');

    // 4. Create Sample Leave Requests
    await LeaveRequest.create([
      {
        user: employeeUser._id,
        employeeCode: 'EMP001',
        employeeName: 'Alex Rivera',
        leaveType: 'Paid Leave',
        startDate: formatDate(-5), // 5 days in future
        endDate: formatDate(-7),
        daysCount: 3,
        reason: 'Family reunion trip and rest.',
        status: 'Pending',
      },
      {
        user: employeeUser._id,
        employeeCode: 'EMP001',
        employeeName: 'Alex Rivera',
        leaveType: 'Sick Leave',
        startDate: formatDate(14),
        endDate: formatDate(14),
        daysCount: 1,
        reason: 'Seasonal flu recovery.',
        status: 'Approved',
        reviewedBy: managerUser._id,
        reviewedByName: 'Michael Chang',
        reviewNotes: 'Get well soon Alex. Take adequate rest.',
        reviewedAt: new Date(Date.now() - 13 * 24 * 3600 * 1000),
      },
      {
        user: employeeUser2._id,
        employeeCode: 'EMP002',
        employeeName: 'Emily Watson',
        leaveType: 'Casual Leave',
        startDate: formatDate(-2),
        endDate: formatDate(-2),
        daysCount: 1,
        reason: 'Personal errands and DMV appointment.',
        status: 'Pending',
      },
    ]);

    console.log('Seeded Leave requests.');

    // 5. Create Announcements
    await Announcement.create([
      {
        title: 'StaffSync HRMS Platform Launch & Welcome',
        content: 'Welcome to the new StaffSync Human Resource Management System! You can now manage your daily attendance, apply for leaves, explore upcoming company training programs, and stay updated with company news directly from your dashboard.',
        category: 'General',
        priority: 'High',
        author: adminUser._id,
        authorName: 'Sarah Jenkins',
        status: 'Published',
        publishDate: new Date(),
      },
      {
        title: 'Updated Remote Work & Flexible Hours Policy',
        content: 'Our updated hybrid working guideline takes effect starting next Monday. All full-time employees are eligible for two flexible work-from-home days per week. Please coordinate your remote schedule with your department manager.',
        category: 'Policy',
        priority: 'Medium',
        author: adminUser._id,
        authorName: 'Sarah Jenkins',
        status: 'Published',
        publishDate: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      },
      {
        title: 'Upcoming Annual Company Hackathon 2026',
        content: 'Join us for our 48-hour annual innovation sprint! Cross-functional teams from Engineering, Marketing, and Operations will build new solutions with fantastic cash prizes and recognition awards.',
        category: 'Event',
        priority: 'Medium',
        author: adminUser._id,
        authorName: 'Sarah Jenkins',
        status: 'Published',
        publishDate: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      },
    ]);

    console.log('Seeded Announcements.');

    // 6. Create Training Programs & Enrollments
    const training1 = await Training.create({
      title: 'Full-Stack Modern React & TypeScript Architecture',
      description: 'Master advanced React patterns, state management, strict TypeScript best practices, and performant frontend architectures for enterprise web apps.',
      trainer: 'David Lee (Principal Architect)',
      department: 'Engineering',
      startDate: formatDate(-10),
      endDate: formatDate(-14),
      capacity: 25,
      enrolledCount: 1,
      status: 'Upcoming',
      createdBy: adminUser._id,
    });

    const training2 = await Training.create({
      title: 'Effective Workplace Communication & Leadership',
      description: 'Interactive workshop focusing on constructive peer feedback, cross-functional collaboration, empathetic management, and conflict resolution.',
      trainer: 'Eleanor Vance (Executive Coach)',
      department: 'All Departments',
      startDate: formatDate(-18),
      endDate: formatDate(-20),
      capacity: 30,
      enrolledCount: 0,
      status: 'Upcoming',
      createdBy: adminUser._id,
    });

    const training3 = await Training.create({
      title: 'Cybersecurity Awareness & Data Protection ISO 27001',
      description: 'Essential security guidelines, phishing prevention, secure credential hygiene, and employee compliance training.',
      trainer: 'Marcus Reed (CISO)',
      department: 'All Departments',
      startDate: formatDate(-3),
      endDate: formatDate(-4),
      capacity: 50,
      enrolledCount: 2,
      status: 'Ongoing',
      createdBy: adminUser._id,
    });

    // Enroll Alex in Training 1
    await TrainingEnrollment.create({
      training: training1._id,
      user: employeeUser._id,
      employeeCode: 'EMP001',
      employeeName: 'Alex Rivera',
      department: 'Engineering',
      enrollmentDate: new Date(),
      status: 'Enrolled',
    });

    console.log('Seeded Training Programs and Enrollments.');
    console.log('--- StaffSync Seeding Completed Successfully! ---');

    return {
      adminUser,
      managerUser,
      employeeUser,
    };
  } catch (error) {
    console.error('Seeding Error:', error);
    throw error;
  }
};

// If run directly via tsx
if (import.meta.url.endsWith(process.argv[1])) {
  (async () => {
    await connectDB();
    await seedDatabase();
    await disconnectDB();
    process.exit(0);
  })();
}
