import { NextResponse } from 'next/server'

import bcrypt from 'bcryptjs'

import { userModel } from '@/models/user-model'
import { connectToMongoDB } from '@/libs/mongo'

export async function POST(request) {
  try {
    const { name, email, phone, password, imageUrl = '', role, salary } = await request.json()

    // console.log('Received data:', { name, email, role, phone })

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
    const salaryNumber = salary ? Number(salary) : 0
    
    const userData = {
      name,
      email,
      phone,
      password: hashedPassword,
      image: imageUrl || null,
      role,
      salary: salaryNumber,
      remaining_salary: salaryNumber // Set remaining_salary equal to salary initially
    }

    console.log('User data to save:', userData)

    // Create and save user
    const user = new userModel(userData)

    console.log('User object before save:', user.toObject())

    try {
      const savedUser = await user.save()
      console.log('Saved user:', savedUser.toObject())
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

export async function PUT(request) {
  try {
    const { id, name, email, phone, imageUrl, role, salary } = await request.json()

    // console.log('Received updated data', name, email, phone, role)

    // Validate required fields
    if (!id || !name || !email || !phone || !role) {
      return NextResponse.json({ message: 'ID, name, email, phone and role are required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 })
    }

    await connectToMongoDB()

    // Check if user exists
    const existingUser = await userModel.findById(id)

    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Check if email is already taken by another user
    const emailExists = await userModel.findOne({ email, _id: { $ne: id } })

    if (emailExists) {
      return NextResponse.json({ message: 'Email already taken by another user' }, { status: 400 })
    }

    // Update user
    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phone,
        role,
        salary,
        remaining_salary: salary,
        image: imageUrl || null
      },
      { new: true, runValidators: true }
    )

    if (!updatedUser) {
      return NextResponse.json({ message: 'Failed to update user' }, { status: 500 })
    }

    return NextResponse.json(
      {
        message: 'User updated successfully',
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          image: updatedUser.image
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update user error:', error)

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
