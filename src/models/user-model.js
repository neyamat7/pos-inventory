import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema({
  name: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  role: {
    type: String,
    required: true
  }
})

export const userModel = mongoose.models.users ?? mongoose.model('users', userSchema)
