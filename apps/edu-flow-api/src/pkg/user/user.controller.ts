import { Request, Response } from 'express';
import { userService } from './user.service';

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
