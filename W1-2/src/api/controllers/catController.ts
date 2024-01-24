import {
  addCat,
  deleteCat,
  getAllCats,
  getCat,
  updateCat,
} from '../models/catModel';
import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import {validationResult} from 'express-validator';
import {MessageResponse} from '../../types/MessageTypes';
import {Cat, User} from '../../types/DBTypes';

const catListGet = async (
  _req: Request,
  res: Response<Cat[]>,
  next: NextFunction
) => {
  try {
    const cats = await getAllCats();
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

const catGet = async (req: Request, res: Response<Cat>, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('cat_post validation', messages);
    next(new CustomError(messages, 400));
    return;
  }

  try {
    const id = Number(req.params.id);
    const cat = await getCat(id);
    res.json(cat);
  } catch (error) {
    next(error);
  }
};

// TODO: create catPost function to add new cat
const catPost = async (
  req: Request<{}, {}, Omit<Cat, 'cat_id'> & {owner: number}>,
  res: Response<MessageResponse, {coords: [number, number]}>,
  next: NextFunction
) => {
  // catPost should use addCat function from catModel
  // catPost should use validationResult to validate req.body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('cat_post validation', messages);
    next(new CustomError(messages, 400));
    return;
  }
  // catPost should use req.file to get filename
  // catPost should use res.locals.coords to get lat and lng (see middlewares.ts)
  // catPost should use req.user to get user_id and role (see passport/index.ts and express.d.ts)
  try {
    const cat: Omit<Cat, 'cat_id'> & {owner: number} = {
      cat_name: req.body.cat_name,
      weight: req.body.weight,
      filename: req.file?.filename || '',
      birthdate: req.body.birthdate,
      lat: res.locals.coords[0],
      lng: res.locals.coords[1],
      owner: req.user.user_id,
    };
    const result = await addCat(cat);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const catPut = async (
  req: Request<{id: string}, {}, Cat>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('cat_post validation', messages);
    next(new CustomError(messages, 400));
    return;
  }

  try {
    const id = Number(req.params.id);
    const cat = req.body;
    const result = await updateCat(cat, id, req.user.user_id, req.user.role);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// TODO: create catDelete function to delete cat
// catDelete should use deleteCat function from catModel
// catDelete should use validationResult to validate req.params.id

const catDelete = async (
  req: Request<{id: number}>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  const errors = validationResult(req.params);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('cat_post validation', messages);
    next(new CustomError(messages, 400));
    return;
  }

  try {
    const result = await deleteCat(req.params.id);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export {catListGet, catGet, catPost, catPut, catDelete};
