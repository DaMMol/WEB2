import {Request, Response, NextFunction} from 'express';
import {MessageResponse} from '../../types/MessageTypes';
import {User} from '../../types/DBTypes';
import UserModel from '../models/userModel';
import CustomError from '../../classes/CustomError';
import bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(12);

// TODO: create the following functions:

// - userGet - get user by id
const userGet = async (
  req: Request<{id: string}>,
  res: Response<User>,
  next: NextFunction
) => {
  try {
    const user = await UserModel.findById(req.params.id);
    res.json(user as unknown as User);
  } catch (error) {
    next(error);
  }
};

// - userListGet - get all users
const userListGet = async (
  req: Request,
  res: Response<User[]>,
  next: NextFunction
) => {
  try {
    const users = await UserModel.find();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// - userPost - create new user. Remember to hash password
const userPost = async (
  req: Request<{}, {}, User>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    const pass = await bcrypt.hash(req.body.password, salt);
    const user = await UserModel.create({...req.body, password: pass});
    res.status(201).json({message: 'User created'});
  } catch (error) {
    next(error);
  }
};

// - userPutCurrent - update current user
const userPutCurrent = async (
  req: Request<{id: string}, {}, User>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    const user = await UserModel.findByIdAndUpdate(req.params.id, req.body);
    if (!user) {
      next(new CustomError('User not found', 404));
    }
    res.json({message: 'User updated'});
  } catch (error) {
    next(error);
  }
};

// - userDeleteCurrent - delete current user
const userDeleteCurrent = async (
  req: Request<{id: string}>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) {
      next(new CustomError('User not found', 404));
    }
    res.json({message: 'User deleted'});
  } catch (error) {
    next(error);
  }
};

// - checkToken - check if current user token is valid: return data from res.locals.user as UserOutput. No need for database query
const checkToken = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    next(new CustomError('No valid user', 404));
  } else {
    res.json(res.locals.user);
  }
};

export {
  userGet,
  userListGet,
  userPost,
  userPutCurrent,
  userDeleteCurrent,
  checkToken,
};
