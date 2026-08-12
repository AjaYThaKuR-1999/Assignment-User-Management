import { Schema, model } from 'mongoose';
import { IUser } from '../middlewares/validate';

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    address: {
      city: { type: String, required: true },
      zipcode: { type: String, required: true },
      geo: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
      }
    }
  },
  { timestamps: true, versionKey: false }
);

const User = model<IUser>('User', userSchema);

export default User;
