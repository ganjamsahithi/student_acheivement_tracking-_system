import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/uploadCertificate.css';

const UploadCertificate = () => {
  const [student, setStudent] = useState({
    name: '',
    studentRegd: '',
    year: '',
    phone: '',
    studentEmail: '',
  });

  const [eventType, setEventType] = useState('technical');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [certificate, setCertificate] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentDetails = async () => {
      const email = localStorage.getItem('studentEmail');

      if (!email) {
        console.error('No student email found in localStorage');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/student/details/${email}`);
        if (!response.ok) throw new Error('Failed to fetch student details');

        const data = await response.json();
        setStudent({ ...data, studentEmail: '' });
      } catch (error) {
        console.error('Error fetching student details:', error);
      }
    };

    fetchStudentDetails();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type !== 'application/pdf') {
      alert('Only PDF files are allowed.');
      return;
    }
    setCertificate(file);
  };

  const handleUpload = async () => {
    if (!certificate || !eventName || !eventDate) {
      alert('Please fill all fields and select a PDF file.');
      return;
    }

    if (!student.studentEmail) {
      alert('Please enter your email.');
      return;
    }

    const formData = new FormData();
    formData.append('certificate', certificate);
    formData.append('name', student.name);
    formData.append('studentRegd', student.studentRegd);
    formData.append('year', student.year);
    formData.append('phone', student.phone);
    formData.append('studentEmail', student.studentEmail);
    formData.append('category', eventType);
    formData.append('eventName', eventName);
    formData.append('eventDate', eventDate);

    try {
      const response = await fetch('http://localhost:5000/api/student/upload-certificate', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Upload response:', result);

      if (!response.ok) throw new Error('Upload failed.');

      setSuccessMessage('Certificate uploaded successfully!');
      setCertificate(null);

      setTimeout(() => {
        navigate('/student/certificates/view');
      }, 2000);
    } catch (error) {
      console.error('Error uploading certificate:', error);
    }
  };

  return (
    <div className="upload-form">
      <h2>Upload Certificate</h2>

      <label>Name:</label>
      <input type="text" value={student.name} readOnly />

      <label>Registration Number:</label>
      <input type="text" value={student.studentRegd} readOnly />

      <label>Year:</label>
      <input type="text" value={student.year} readOnly />

      <label>Phone Number:</label>
      <input type="text" value={student.phone} readOnly />

      <label>Email:</label>
      <input
        type="email"
        value={student.studentEmail}
        onChange={(e) => setStudent({ ...student, studentEmail: e.target.value })}
        required
      />

      <label>Event Name:</label>
      <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} required />

      <label>Event Date:</label>
      <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />

      <label>Select Event Type:</label>
      <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
        <option value="technical">Technical</option>
        <option value="non-technical">Non-Technical</option>
      </select>

      <label>Upload Certificate (PDF Only):</label>
      <input type="file" name="certificate" accept="application/pdf" onChange={handleFileChange} />

      <button onClick={handleUpload}>Upload</button>

      {successMessage && <p className="success-message">{successMessage}</p>}
    </div>
  );
};

export default UploadCertificate;
