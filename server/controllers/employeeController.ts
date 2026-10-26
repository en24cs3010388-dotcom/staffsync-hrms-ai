import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { Employee } from '../models/Employee.ts';
import { User } from '../models/User.ts';

export const getEmployees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, department, status } = req.query;

    const filter: any = {};

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { employeeCode: searchRegex },
        { position: searchRegex },
      ];
    }

    if (department && department !== 'All') {
      filter.department = department;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    const employees = await Employee.find(filter).sort({ createdAt: -1 });

    // Non-HR users should not see sensitive financial fields (salary)
    const isHR = req.user?.role === 'HR Admin';
    const sanitized = employees.map(emp => {
      const obj = emp.toObject();
      if (!isHR) {
        delete obj.salary;
      }
      return obj;
    });

    res.json({
      count: sanitized.length,
      employees: sanitized,
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);

    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    const isHR = req.user?.role === 'HR Admin';
    const obj = employee.toObject();
    if (!isHR && req.user?.email !== employee.email) {
      delete obj.salary;
    }

    res.json({ employee: obj });
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      employeeCode,
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      dateOfJoining,
      salary,
      address,
      emergencyContact,
      role = 'Employee',
      password = 'Password123!',
    } = req.body;

    if (!employeeCode || !firstName || !lastName || !email || !department || !position) {
      res.status(400).json({ message: 'Missing required employee fields.' });
      return;
    }

    // Check duplicate email or code
    const existingEmployee = await Employee.findOne({
      $or: [{ email: email.toLowerCase() }, { employeeCode: employeeCode.toUpperCase() }],
    });

    if (existingEmployee) {
      res.status(409).json({ message: 'An employee with this email or employee code already exists.' });
      return;
    }

    // Check or create associated User account
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        name: `${firstName} ${lastName}`,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role || 'Employee',
        employeeId: employeeCode.toUpperCase(),
        status: 'Active',
      });
    }

    const employee = await Employee.create({
      user: user._id,
      employeeCode: employeeCode.toUpperCase(),
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || '',
      department,
      position,
      dateOfJoining: dateOfJoining || new Date(),
      salary: salary ? Number(salary) : 0,
      address: address || '',
      emergencyContact: emergencyContact || { name: '', relationship: '', phone: '' },
      status: 'Active',
    });

    res.status(201).json({
      message: 'Employee created successfully with active login credentials.',
      employee,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      phone,
      department,
      position,
      salary,
      address,
      emergencyContact,
      status,
    } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    if (firstName) employee.firstName = firstName;
    if (lastName) employee.lastName = lastName;
    if (phone !== undefined) employee.phone = phone;
    if (department) employee.department = department;
    if (position) employee.position = position;
    if (salary !== undefined) employee.salary = Number(salary);
    if (address !== undefined) employee.address = address;
    if (emergencyContact) employee.emergencyContact = emergencyContact;
    if (status) employee.status = status;

    await employee.save();

    // Sync name with User if exists
    if (employee.user && (firstName || lastName)) {
      await User.findByIdAndUpdate(employee.user, {
        name: `${employee.firstName} ${employee.lastName}`,
      });
    }

    res.json({
      message: 'Employee updated successfully',
      employee,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleEmployeeStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);

    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    const nextStatus = employee.status === 'Active' ? 'Inactive' : 'Active';
    employee.status = nextStatus;
    await employee.save();

    // Also update associated User account status
    if (employee.user) {
      await User.findByIdAndUpdate(employee.user, { status: nextStatus });
    } else {
      await User.findOneAndUpdate({ email: employee.email }, { status: nextStatus });
    }

    res.json({
      message: `Employee marked as ${nextStatus}`,
      employee,
    });
  } catch (error) {
    next(error);
  }
};
