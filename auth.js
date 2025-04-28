const express = require('express');
const bcrypt = require('bcryptjs');
const Faculty = require('../models/faculty');
const Student = require('../models/student');

const router = express.Router();

// 🔹 REGISTER Route
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password, role, branch, facultyRegd, studentRegd, year, section } = req.body;

    // 🔸 Check if the email is already registered
    const existingFaculty = await Faculty.findOne({ email });
    const existingStudent = await Student.findOne({ email });

    if (existingFaculty || existingStudent) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // 🔸 Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === 'faculty') {
      const existingFacultyRegd = await Faculty.findOne({ facultyRegd });
      if (existingFacultyRegd) {
        return res.status(400).json({ message: 'Faculty Regd No already exists' });
      }

      const newFaculty = new Faculty({
        name,
        phone,
        email,
        password: hashedPassword,
        facultyRegd,
        branch,
        role, // 🔹 Storing role in DB
      });

      await newFaculty.save();
      return res.status(201).json({ message: 'Faculty registered successfully', role });
    }

    if (role === 'student') {
      const existingStudentRegd = await Student.findOne({ studentRegd });
      if (existingStudentRegd) {
        return res.status(400).json({ message: 'Student Regd No already exists' });
      }

      const newStudent = new Student({
        name,
        phone,
        email,
        password: hashedPassword,
        studentRegd,
        branch,
        year,
        section,
        role, // 🔹 Storing role in DB
      });

      await newStudent.save();
      return res.status(201).json({ message: 'Student registered successfully', role });
    }

    res.status(400).json({ message: 'Invalid role selected' });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔹 LOGIN Route
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    let user;

    // 🔸 Fetch user from correct schema
    if (role === 'faculty') {
      user = await Faculty.findOne({ email });
    } else if (role === 'student') {
      user = await Student.findOne({ email });
    } else {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    // 🔸 Check if user exists
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // 🔸 Compare the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // 🔹 Send user details in response
    res.json({
      message: 'Login successful',
      role: user.role,
      name: user.name,
      email: user.email,
      branch: user.branch,
      ...(role === 'faculty' && { facultyRegd: user.facultyRegd }),
      ...(role === 'student' && { studentRegd: user.studentRegd, year: user.year, section: user.section }),
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
