import mongoose from 'mongoose';
import {User} from '../../types/DBTypes';
// TODO: mongoose schema for user

const userSchema = new mongoose.Schema({
  user_name: String,
  email: {type: String, unique: true},
  role: {
    type: String,
    enum: ['user', 'admin'],
  },
  password: String,
});

const UserModel = mongoose.model<User>('User', userSchema);

export default UserModel;
