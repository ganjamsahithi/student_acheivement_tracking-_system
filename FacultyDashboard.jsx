import React, { useState, useEffect } from 'react';   
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import '../assets/css/facultyDashboard.css';

const FacultyDashboard = () => {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [searchRegd, setSearchRegd] = useState('');
  const [searchYear, setSearchYear] = useState('');
  const [searchEvent, setSearchEvent] = useState('');
  const [uniqueEvents, setUniqueEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const navigate = useNavigate();

  const fetchCertificates = async (category) => {
    try {
      const response = await fetch('http://localhost:5000/api/student/faculty/certificates');
      if (!response.ok) throw new Error('Failed to fetch certificates');

      const data = await response.json();
      const uploadedCertificates = data.filter(cert => 
        cert.filePath && cert.category?.toLowerCase() === category.toLowerCase()
      );

      setCertificates(uploadedCertificates);
      setFilteredCertificates(uploadedCertificates);

      const eventNames = [...new Set(uploadedCertificates.map(cert => cert.eventName))];
      setUniqueEvents(eventNames);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  useEffect(() => {
    let filtered = certificates.filter(cert =>
      (!searchRegd || cert.studentRegd.toLowerCase().includes(searchRegd.toLowerCase())) &&
      (!searchYear || cert.year.toString() === searchYear) &&
      (!searchEvent || cert.eventName === searchEvent)
    );

    setFilteredCertificates(filtered);
  }, [searchRegd, searchYear, searchEvent, certificates]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowTable(true);
    fetchCertificates(category);
  };

  const handleReject = async (certId) => {
    if (window.confirm("Are you sure you want to reject this certificate?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/student/faculty/certificates/${certId}/reject`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('Failed to reject certificate');

        setCertificates(prev => prev.map(cert => 
          cert._id === certId ? { ...cert, status: "Rejected" } : cert
        ));
        setFilteredCertificates(prev => prev.map(cert => 
          cert._id === certId ? { ...cert, status: "Rejected" } : cert
        ));
      } catch (error) {
        console.error('Error rejecting certificate:', error);
      }
    }
  };

  const handleApprove = async (certId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/student/faculty/certificates/${certId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to approve certificate');

      setCertificates(prev => prev.map(cert => 
        cert._id === certId ? { ...cert, status: "Approved" } : cert
      ));
      setFilteredCertificates(prev => prev.map(cert => 
        cert._id === certId ? { ...cert, status: "Approved" } : cert
      ));
    } catch (error) {
      console.error('Error approving certificate:', error);
    }
  };

  const handleDownload = () => {
    const worksheetData = filteredCertificates.map(({ status, ...cert }) => cert);
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Certificates");
    XLSX.writeFile(workbook, `${selectedCategory || 'all'}_certificates.xlsx`);
  };

  const handleDownloadCertificates = async () => {
    try {
      const certificateUrls = filteredCertificates.map(cert => cert.filePath);
      
      const response = await fetch('http://localhost:5000/api/student/faculty/download-certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ certificates: certificateUrls })
      });

      if (!response.ok) throw new Error('Failed to download certificates');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedCategory || 'all'}_certificates.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading certificates:', error);
      alert('Failed to download certificates');
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Faculty Dashboard - Review Certificates</h2>

      {!showTable ? (
        <div className="category-selection">
          <button 
            className="category-btn technical" 
            onClick={() => handleCategorySelect('Technical')}
          >
            Technical Certificates
          </button>
          <button 
            className="category-btn non-technical" 
            onClick={() => handleCategorySelect('Non-Technical')}
          >
            Non-Technical Certificates
          </button>
        </div>
      ) : (
        <>
          <div className="header-container">
            <button 
              className="back-btn" 
              onClick={() => {
                setShowTable(false);
                setSelectedCategory(null);
                setFilteredCertificates([]);
                setCertificates([]);
              }}
            >
              Back to Categories
            </button>
            <h3>{selectedCategory} Certificates</h3>
          </div>

          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search by Regd No." 
              value={searchRegd} 
              onChange={(e) => setSearchRegd(e.target.value)} 
            />

            <select value={searchYear} onChange={(e) => setSearchYear(e.target.value)}>
              <option value="">Select Year</option>
              {[...new Set(certificates.map(cert => cert.year))].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select value={searchEvent} onChange={(e) => setSearchEvent(e.target.value)}>
              <option value="">Select Event</option>
              {uniqueEvents.map(event => (
                <option key={event} value={event}>{event}</option>
              ))}
            </select>
          </div>

          <div className="download-buttons">
            <button className="download-btn" onClick={handleDownload}>
              Download as Excel
            </button>
            <button className="download-btn download-certs" onClick={handleDownloadCertificates}>
              Download Certificates
            </button>
          </div>

          <table className="styled-table">
            <thead>
              <tr>
                <th>Sl. No</th>
                <th>Name</th>
                <th>Regd No.</th>
                <th>Year</th>
                <th>Event Name</th>
                <th>Event Date</th>
                <th>Category</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Certificate</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCertificates.map((cert, index) => (
                <tr key={cert._id}>
                  <td>{index + 1}</td>
                  <td>{cert.name}</td>
                  <td>{cert.studentRegd}</td>
                  <td>{cert.year}</td>
                  <td>{cert.eventName}</td>
                  <td>{new Date(cert.eventDate).toLocaleDateString()}</td>
                  <td>{cert.category}</td>
                  <td>{cert.phone}</td>
                  <td>{cert.studentEmail}</td>
                  <td>
                    <a href={`http://localhost:5000/${cert.filePath}`} target="_blank" rel="noopener noreferrer">View</a>
                  </td>
                  <td>{cert.status || "Pending"}</td>
                  <td>
                    <div className="action-buttons">
                      {cert.status !== "Approved" && (
                        <button className="approve-btn" onClick={() => handleApprove(cert._id)}>
                          Approve
                        </button>
                      )}
                      {cert.status !== "Rejected" && (
                        <button className="reject-btn" onClick={() => handleReject(cert._id)}>
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <button className="logout-btn" onClick={() => navigate('/login')}>Logout</button>
    </div>
  );
};

export default FacultyDashboard;