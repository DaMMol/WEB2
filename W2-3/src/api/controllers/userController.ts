import {Request, Response, NextFunction} from 'express';
import {MessageResponse} from '../../types/MessageTypes';
import {User, UserOutput} from '../../types/DBTypes';
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
    res.json({
      _id: user!._id,
      user_name: user!.user_name,
      email: user!.email,
    } as unknown as User);
  } catch (error) {
    next(error);
  }
};

// - userListGet - get all users
const userListGet = async (
  req: Request,
  res: Response<UserOutput[]>,
  next: NextFunction
) => {
  try {
    const users = await UserModel.find();
    const returnusers = users.map((user) => ({
      _id: user._id,
      user_name: user.user_name,
      email: user.email,
    }));
    res.json(returnusers);
  } catch (error) {
    next(error);
  }
};

// - userPost - create new user. Remember to hash password
const userPost = async (
  req: Request<{}, {}, User>,
  res: Response<MessageResponse & {data: UserOutput}>,
  next: NextFunction
) => {
  try {
    const pass = await bcrypt.hash(req.body.password, salt);
    const user = await UserModel.create({
      ...req.body,
      password: pass,
      role: 'user',
    });
    res.status(200).json({
      message: 'User created',
      data: {_id: user._id, user_name: user.user_name, email: user.email},
    });
  } catch (error) {
    next(error);
  }
};

// - userPutCurrent - update current user
const userPutCurrent = async (
  req: Request,
  res: Response<MessageResponse & {data: UserOutput}>,
  next: NextFunction
) => {
  try {
    const user = await UserModel.findByIdAndUpdate(
      res.locals.user._id,
      req.body,
      {
        returnDocument: 'after',
      }
    );
    if (!user) {
      next(new CustomError('User not found', 404));
    }
    res.json({
      message: 'User updated',
      data: {_id: user!._id, user_name: user!.user_name, email: user!.email},
    });
  } catch (error) {
    next(error);
  }
};

// - userDeleteCurrent - delete current user
const userDeleteCurrent = async (
  req: Request,
  res: Response<MessageResponse & {data: UserOutput}>,
  next: NextFunction
) => {
  try {
    if (!res.locals.user) {
      next(new CustomError('User not found', 404));
    }
    const user = (await UserModel.findByIdAndDelete(
      res.locals.user._id
    )) as unknown as User;
    res.json({
      message: 'User deleted',
      data: {_id: user!._id, user_name: user!.user_name, email: user!.email},
    });
  } catch (error) {
    next(error);
  }
};

// - checkToken - check if current user token is valid: return data from res.locals.user as UserOutput. No need for database query
const checkToken = async (req: Request, res: Response, next: NextFunction) => {
  if (!res.locals.user) {
    next(new CustomError('No valid user', 404));
  } else {
    res.json({
      _id: res.locals.user._id,
      user_name: res.locals.user.user_name,
      email: res.locals.user.email,
    });
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
