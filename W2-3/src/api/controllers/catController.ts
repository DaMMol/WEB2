import {Request, Response, NextFunction} from 'express';
import {MessageResponse} from '../../types/MessageTypes';
import {Cat} from '../../types/DBTypes';
import CatModel from '../models/catModel';
import CustomError from '../../classes/CustomError';

// TODO: create following functions:
// - catGetByUser - get all cats by current user id
const catGetByUser = async (
  req: Request,
  res: Response<Cat[]>,
  next: NextFunction
) => {
  try {
    const cats = await CatModel.find({owner: req.user!._id});
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

// - catGetByBoundingBox - get all cats by bounding box coordinates (getJSON)
const catGetByBoundingBox = async (
  req: Request<{coord1: string; coord2: string}>,
  res: Response<Cat[]>,
  next: NextFunction
) => {
  try {
    const coordinates = [req.params.coord1, req.params.coord2];
    const cats = await CatModel.find({location: coordinates});
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

// - catPutAdmin - only admin can change cat owner
const catPutAdmin = async (
  req: Request<{id: string}, {}, Cat>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    if (req.user!.role !== 'admin') {
      next(new CustomError('Only admins allowed', 403));
    }
    const cat = await CatModel.findByIdAndUpdate(req.params.id);

    if (!cat) {
      next(new CustomError('Cat not found', 404));
    }
    res.json({message: 'Cat updated'});
  } catch (error) {
    next(error);
  }
};

// - catDeleteAdmin - only admin can delete cat
const catDeleteAdmin = async (
  req: Request<{id: string}>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    if (req.user!.role !== 'admin') {
      next(new CustomError('Only admins allowed', 403));
    }
    const cat = await CatModel.findByIdAndDelete(req.params.id);

    if (!cat) {
      next(new CustomError('Cat not found', 404));
    }
    res.json({message: 'Cat deleted'});
  } catch (error) {
    next(error);
  }
};

// - catDelete - only owner can delete cat
const catDelete = async (
  req: Request<{id: string}>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    const cat = await CatModel.findById(req.params.id);
    if (!cat) {
      next(new CustomError('Cat not found', 404));
    }
    if (cat!.owner === req.user!._id) {
      const ripcat = await CatModel.findByIdAndDelete(req.params.id);
      res.json({message: 'Cat deleted'});
    }
  } catch (error) {
    next(error);
  }
};

// - catPut - only owner can update cat
const catPut = async (
  req: Request<{id: string}, {}, Cat>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    const cat = await CatModel.findById(req.params.id);
    if (!cat) {
      next(new CustomError('Cat not found', 404));
    }
    if (cat!.owner === req.user!._id) {
      const updatedcat = await CatModel.findByIdAndUpdate(
        req.params.id,
        req.body
      );
      res.json({message: 'Cat updated'});
    }
  } catch (error) {
    next(error);
  }
};

// - catGet - get cat by id
const catGet = async (
  req: Request<{id: string}>,
  res: Response<Cat>,
  next: NextFunction
) => {
  try {
    const cat = await CatModel.findById(req.params.id);
    res.json(cat as unknown as Cat);
  } catch (error) {
    next(error);
  }
};

// - catListGet - get all cats
const catListGet = async (
  req: Request,
  res: Response<Cat[]>,
  next: NextFunction
) => {
  try {
    const cats = await CatModel.find();
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

// - catPost - create new cat
const catPost = async (
  req: Request<{}, {}, Cat>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    const cat = await CatModel.create(req.body);
    res.status(201).json({message: 'Cat created'});
  } catch (error) {
    next(error);
  }
};

export {
  catPost,
  catListGet,
  catGet,
  catPut,
  catDelete,
  catDeleteAdmin,
  catPutAdmin,
  catGetByBoundingBox,
  catGetByUser,
};
