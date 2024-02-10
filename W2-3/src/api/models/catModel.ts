import mongoose, {Types} from 'mongoose';
import {Cat} from '../../types/DBTypes';

// TODO: mongoose schema for cat
const catSchema = new mongoose.Schema({
  cat_name: String,
  weight: Number,
  filename: String,
  birthdate: String,
  location: {
    type: String,
    coordinates: [Number, Number],
  },
  owner: {
    _id: Types.ObjectId,
    user_name: String,
    email: String,
  },
});

const CatModel = mongoose.model<Cat>('Cat', catSchema);

export default CatModel;
