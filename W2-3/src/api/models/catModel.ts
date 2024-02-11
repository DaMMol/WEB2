import mongoose, {Types} from 'mongoose';
import {Cat} from '../../types/DBTypes';

// TODO: mongoose schema for cat
const catSchema = new mongoose.Schema<Cat>(
  {
    cat_name: String,
    weight: Number,
    filename: String,
    birthdate: String,
    location: {
      type: {
        $type: String,
        enum: ['Point'],
      },
      coordinates: {
        $type: [Number],
      },
    },
    owner: {
      $type: Types.ObjectId,
      ref: 'User',
    },
  },
  {typeKey: '$type'}
);

const CatModel = mongoose.model<Cat>('Cat', catSchema);

export default CatModel;
