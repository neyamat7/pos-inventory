import mongoose from 'mongoose'

export async function connectToMongoDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_CONNECTION_STRING)

    console.log('Connected to MongoDB')

    return conn
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  }
}
