import React, { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import '../assets/css/studentDashboard.css';

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showCertificatesMenu, setShowCertificatesMenu] = useState(false);
  const [editableFields, setEditableFields] = useState({});
  const [isEdited, setIsEdited] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const email = localStorage.getItem('studentEmail');
        if (!email) {
          console.error('No student email found in localStorage');
          return;
        }

        const response = await fetch(`http://localhost:5000/api/student/details/${email}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }

        const data = await response.json();
        setStudent(data);
        setEditableFields(data);
      } catch (error) {
        console.error('Error fetching student details:', error);
      }
    };

    fetchStudentDetails();
  }, []);

  const handleSaveChanges = async () => {
    try {
      const email = localStorage.getItem('studentEmail');
      const response = await fetch('http://localhost:5000/api/student/update-details', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editableFields,
          email,
          name: editableFields.name,
          phone: editableFields.phone,
          year: editableFields.year,
          studentRegd: editableFields.studentRegd,
          studentEmail: email
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update details');
      }

      const updatedData = await response.json();
      setStudent(updatedData);
      setEditableFields(updatedData);
      setSuccessMessage('Profile updated successfully!');
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating student details:', error);
      setSuccessMessage('Failed to update profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('studentEmail');
    navigate('/login');
  };

  return (
    <div className="student-dashboard">
      <h1>Student Dashboard</h1>
      <div className="header">
        <div className="logout-container">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {!showProfile && !showCertificatesMenu && (
        <div className="floating-buttons-container">
          <button className="floating-btn profile-btn" onClick={() => setShowProfile(true)}>Profile</button>
          <button className="floating-btn certificates-btn" onClick={() => setShowCertificatesMenu(true)}>My Certificates</button>
        </div>
      )}

      {showCertificatesMenu && (
        <div className="certificate-menu">
          <button className="floating-btn" onClick={() => navigate('/student/certificates/view')}>Uploaded Certificates</button>
          <button className="floating-btn" onClick={() => navigate('/student/certificates/upload')}>Upload a Certificate</button>
          <button className="back-btn" onClick={() => setShowCertificatesMenu(false)}>Back</button>
        </div>
      )}

      {showProfile && student && (
        <div className="student-info no-background">
          {['name', 'phone', 'branch', 'year', 'section', 'studentRegd'].map((field) => (
            <p key={field}>
              <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong>
              <input 
                type="text" 
                value={editableFields[field] || ''} 
                onChange={(e) => setEditableFields(prev => ({ ...prev, [field]: e.target.value }))} 
                className="editable-input" 
              />
            </p>
          ))}
          <p><strong>Email:</strong> {student.email}</p>
          {successMessage && <p className="success-message">{successMessage}</p>}
          <button className="save-btn single-save-btn" onClick={handleSaveChanges}>Save Changes</button>
          <button className="back-btn" onClick={() => setShowProfile(false)}>Back to Dashboard</button>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
