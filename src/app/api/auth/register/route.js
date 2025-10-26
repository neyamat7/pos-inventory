import { NextResponse } from 'next/server'

import bcrypt from 'bcryptjs'

import { userModel } from '@/models/user-model'
import { connectToMongoDB } from '@/libs/mongo'

export async function POST(request) {
  try {
    const { name, email, password, imageUrl = '', role } = await request.json()

    console.log('Received data:', { name, email, role })

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'Name, email, password and role are required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 })
    }

    await connectToMongoDB()

    // Check if user already exists
    const existingUser = await userModel.findOne({ email })

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists with this email' }, { status: 400 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user object
    const userData = {
      name,
      email,
      password: hashedPassword,
      image: imageUrl || null,
      role
    }

    console.log('User data to save:', userData)

    // Create and save user
    const user = new userModel(userData)

    console.log('User object before save:', user.toObject())

    try {
      const savedUser = await user.save()
    } catch (err) {
      console.error('Error saving user:', err)
      console.error('Error details:', err.message)

      return NextResponse.json({ message: 'Error saving user to database: ' + err.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
