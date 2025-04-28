import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    branch: '',
    role: '',
    facultyRegd: '',
    studentRegd: '',
    year: '',
    section: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Registration successful! Redirecting to login page.');
        navigate('/login');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      setError('Server error. Please try again later.');
    }
  };

  return (
    <div className="register-container">
      <h1>Register Page</h1>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input type="text" name="name" placeholder="Enter your name" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Phone Number:</label>
          <input type="tel" name="phone" placeholder="Enter 10-digit phone" value={formData.phone} onChange={handleChange} pattern="[0-9]{10}" title="Enter a 10-digit phone number" required />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input type="password" name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Confirm Password:</label>
          <input type="password" name="confirmPassword" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Branch:</label>
          <select name="branch" value={formData.branch} onChange={handleChange} required>
            <option value="">Select Branch</option>
            <option value="CSE">Computer Science</option>
            <option value="ECE">Electronics</option>
            <option value="MECH">Mechanical</option>
            <option value="CIVIL">Civil</option>
          </select>
        </div>

        <div className="form-group">
          <label>Role:</label>
          <select name="role" value={formData.role} onChange={handleChange} required>
            <option value="">Select Role</option>
            <option value="faculty">Faculty</option>
            <option value="student">Student</option>
          </select>
        </div>

        {formData.role === 'faculty' && (
          <div className="form-group">
            <label>Faculty Regd No:</label>
            <input type="text" name="facultyRegd" placeholder="5-digit Regd No" value={formData.facultyRegd} onChange={handleChange} pattern="[0-9]{5}" title="Enter a 5-digit registration number" required />
          </div>
        )}

        {formData.role === 'student' && (
          <>
            <div className="form-group">
              <label>Student Regd No:</label>
              <input type="text" name="studentRegd" placeholder="10-char Regd No" value={formData.studentRegd} onChange={handleChange} pattern="[A-Za-z0-9]{10}" title="Enter a 10-character alphanumeric registration number" required />
            </div>
            <div className="form-group">
              <label>Year:</label>
              <select name="year" value={formData.year} onChange={handleChange} required>
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
            <div className="form-group">
              <label>Section:</label>
              <input type="text" name="section" placeholder="e.g., A, B" value={formData.section} onChange={handleChange} pattern="[A-Za-z]{1}" title="Enter a single letter for section" required />
            </div>
          </>
        )}

        <button type="submit" className="submit-btn">Register</button>
      </form>
    </div>
  );
};

export default Register;
