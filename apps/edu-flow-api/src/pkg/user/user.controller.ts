import { Request, Response } from 'express';
import { userService } from './user.service';
import { TOKEN } from '../../configs/callToken';
import { CLIENT_RENEG_LIMIT } from 'tls';

export class UserController {
  async getListUsers(req: Request, res: Response) {
    try {
      const users = await userService.findAll();
      return res
        .status(200)
        .json({ message: 'Users fetched successfully', data: users });
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Internal server error', error: error });
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      const { email } = req.body;
      console.log(req.body);
      const userData = await userService.findByEmail(email);
      return res
        .status(200)
        .json({ message: 'Login Successfully', data: userData });
    } catch (err) {
      return res
        .status(500)
        .json({ message: 'Internal server error', error: err });
    }
  }

  async googleSync(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const userData = await userService.findByEmail(email);
      if (!userData) {
        return res.status(404).json({ message: 'User not found in system' });
      }

      // Generate Backend JWT Token
      const jwt = require('jsonwebtoken');
      const secret =
        TOKEN.JWT;
      const backendToken = jwt.sign(
        {
          id: userData.id,
          role: userData.role,
          email: userData.email,
        },
        secret,
        { expiresIn: '10m' },
      );

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 10 * 60 * 1000, // ⚠️ Express ใช้หน่วย "มิลลิวินาที" (10 นาที * 60 วิ * 1000)
      };

      res.cookie('role', userData.role, cookieOptions);
      res.cookie('ac_tk', backendToken, cookieOptions);

      return res.status(200).json({
        message: 'Sync successfully',
        data: {
          id: userData.id,
          role: userData.role,
          email: userData.email,
          backendToken,
        },
      });
    } catch (err) {
      console.error('Google Sync Error:', err);
      return res
        .status(500)
        .json({ message: 'Internal server error', error: err });
    }
  }

  async getStudent(req: Request, res: Response) {
    try {
      const students = await userService.findStudents();
      return res
        .status(200)
        .json({ message: 'Students fetched successfully', data: students });
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Internal server error', error: error });
    }
  }

  async getTeacher(req: Request, res: Response) {
    try {
      const teacher = await userService.findTeachers();
      console.log(teacher);
      return res
        .status(200)
        .json({ message: 'Students fetched successfully', data: teacher });
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Internal server error', error: error });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const { name, sureName, email, role } = req.body;
      const user = await userService.create({ name, sureName, email, role });
      return res
        .status(201)
        .json({ message: 'User created successfully', data: user });
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Internal server error', error: error });
    }
  }
}

export const userController = new UserController();
