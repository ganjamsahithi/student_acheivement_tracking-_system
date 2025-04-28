import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import FacultyDashboard from './components/FacultyDashboard';
import StudentDashboard from './components/StudentDashboard';
import UploadCertificate from './components/UploadCertificate';
import ViewCertificates from './components/ViewCertificates'; 
function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/student/certificates/upload" element={<UploadCertificate />} />
          <Route path="/student/certificates/view" element={<ViewCertificates />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;