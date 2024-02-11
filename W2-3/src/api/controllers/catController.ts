import {Request, Response, NextFunction} from 'express';
import {MessageResponse} from '../../types/MessageTypes';
import {Cat, User} from '../../types/DBTypes';
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
    const cats = await CatModel.find({owner: res.locals.user._id});
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

// - catGetByBoundingBox - get all cats by bounding box coordinates (getJSON)
const catGetByBoundingBox = async (
  req: Request<{bottomLeft: string; topRight: string}>,
  res: Response<Cat[]>,
  next: NextFunction
) => {
  try {
    const [lon1, lat1] = (req.query.bottomLeft as string).split(',');
    const [lon2, lat2] = (req.query.topRight as string).split(',');
    const cats = await CatModel.find({
      'location.coordinates.0': {$gte: lat1, $lte: lat2},
      'location.coordinates.1': {$gte: lon1, $lte: lon2},
    });
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

// - catPutAdmin - only admin can change cat owner
const catPutAdmin = async (
  req: Request<{id: string}, {}, Cat>,
  res: Response<MessageResponse & {data: Cat}>,
  next: NextFunction
) => {
  try {
    if (res.locals.user.role !== 'admin') {
      next(new CustomError('Only admins allowed', 403));
    }
    const cat = await CatModel.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
    }).populate('owner');

    if (!cat) {
      next(new CustomError('Cat not found', 404));
    }
    res.json({message: 'Cat updated', data: cat as Cat});
  } catch (error) {
    next(error);
  }
};

// - catDeleteAdmin - only admin can delete cat
const catDeleteAdmin = async (
  req: Request<{id: string}>,
  res: Response<MessageResponse & {data: Cat}>,
  next: NextFunction
) => {
  try {
    if (res.locals.user.role !== 'admin') {
      next(new CustomError('Only admins allowed', 403));
    }
    const cat = await CatModel.findByIdAndDelete(req.params.id);

    if (!cat) {
      next(new CustomError('Cat not found', 404));
    }
    res.json({message: 'Cat deleted', data: cat as unknown as Cat});
  } catch (error) {
    next(error);
  }
};

// - catDelete - only owner can delete cat
const catDelete = async (
  req: Request<{id: string}>,
  res: Response<MessageResponse & {data: Cat}>,
  next: NextFunction
) => {
  try {
    const cat = await CatModel.findById(req.params.id);
    if (!cat) {
      next(new CustomError('Cat not found', 404));
    }
    if (String(cat!.owner._id) === res.locals.user._id) {
      const ripcat = await CatModel.findByIdAndDelete(req.params.id);
      res.json({message: 'Cat deleted', data: ripcat as unknown as Cat});
    }
  } catch (error) {
    next(error);
  }
};

// - catPut - only owner can update cat
const catPut = async (
  req: Request<{id: string}, {}, Cat>,
  res: Response<MessageResponse & {data: Cat}>,
  next: NextFunction
) => {
  try {
    const cat = await CatModel.findById(req.params.id);
    if (!cat) {
      next(new CustomError('Cat not found', 404));
    }
    if (String(cat!.owner._id) === res.locals.user._id) {
      const updatedcat = await CatModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          returnDocument: 'after',
        }
      ).populate('owner');
      res.json({message: 'Cat updated', data: updatedcat as Cat});
    }
    next(new CustomError('Not owner', 403));
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
    const cat = await CatModel.findById(req.params.id).populate('owner');
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
    const cats = await CatModel.find().populate('owner');
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

// - catPost - create new cat
const catPost = async (
  req: Request<{}, {}, Cat>,
  res: Response<MessageResponse & {data: Cat}>,
  next: NextFunction
) => {
  try {
    const cat = await CatModel.create({
      ...req.body,
      owner: res.locals.user,
      location: res.locals.coords,
      filename: req.file?.filename,
    });
    res.status(200).json({message: 'Cat created', data: cat});
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
