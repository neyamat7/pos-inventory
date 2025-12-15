import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema({
  name: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  phone: {
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
  },
  salary: {
    type: Number,
  },
  remaining_salary: {
    type: Number,
    default: 0,
  },
  last_salary_reset_month: {
    type: String,
    default: "",
  },
},
{ timestamps: true }
)

// Properly handle model caching in development
export const userModel = mongoose.models.users || mongoose.model('users', userSchema)
