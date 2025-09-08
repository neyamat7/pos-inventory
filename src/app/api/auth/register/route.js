import { NextResponse } from 'next/server' // Import NextResponse to handle the response

import { userModel } from '@/models/user-model'
import { connectToMongoDB } from '@/libs/mongo'

export async function POST(request) {
  try {
    const { name, email, password, imageUrl = '' } = await request.json()

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Name, email, and password are required' }, { status: 400 })
    }

    // Validate email format using a regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 })
    }

    // Validate password strength using a regular expression
    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/

    // if (!passwordRegex.test(password)) {
    //   return NextResponse.json(
    //     {
    //       message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
    //     },
    //     { status: 400 }
    //   )
    // }

    await connectToMongoDB() // Ensure the database is connected

    // Check if user already exists
    const existingUser = await userModel.findOne({ email })

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists with this email' }, { status: 400 })
    }

    // Create new user
    const user = new userModel({
      name,
      email,
      password,
      image: imageUrl || null
    })

    console.log('new user', user)

    // Save the new user to the database
    try {
      await user.save()
    } catch (err) {
      console.error('Error saving user:', err)
    }

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
