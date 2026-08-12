import { Request, Response } from 'express';
import User from '../models/User';

// Create a new user
const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { body } = req;
    const { email } = body;

    const existingUser = await User.findOne({ email: email.toLowerCase() }).lean();
    if (existingUser) {
      res.status(409).json({ success: false, message: 'A user with this email already exists' });
      return;
    }

    const user = await User.create(body);
    res.status(201).json({ success: true, message: 'User created successfully', data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

// List users with pagination and search
const listUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    let { page, limit, search } = req.query as any;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};
    if (search) {
      const searchRegex = new RegExp(String(search).trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: users
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

// Get user details by ID
const getUserDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).lean();
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

// Update user details
const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { params, body } = req;
    const { id } = params;
    const { email } = body;

    if (email) {
      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: id } }).lean();
      if (existingUser) {
        res.status(409).json({ success: false, message: 'A user with this email already exists' });
        return;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();
    if (!updatedUser) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'User updated successfully', data: updatedUser });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

// Delete user
const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id).lean();
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

export {
  createUser,
  listUsers,
  getUserDetails,
  updateUser,
  deleteUser
};
