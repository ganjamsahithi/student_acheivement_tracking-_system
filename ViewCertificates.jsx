import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import '../assets/css/viewCertificates.css';

const ViewCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch certificates for the logged-in student
  const fetchCertificates = async () => {
    setLoading(true);
    setError('');

    try {
      const email = localStorage.getItem('studentEmail');
      if (!email) {
        setError('No student email found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/student/certificates/${email}`);
      if (!response.ok) throw new Error('Failed to fetch certificates.');

      const data = await response.json();
      console.log("Fetched Certificates:", data);

      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from server.');
      }

      setCertificates(data);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setError('Error fetching certificates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();

    // Polling to update table every 5 sec
    const interval = setInterval(fetchCertificates, 5000);
    
    // Event listener for certificate uploads
    const handleNewCertificate = () => {
      console.log('New certificate uploaded. Fetching latest certificates...');
      fetchCertificates();
    };

    window.addEventListener('certificateUploaded', handleNewCertificate);

    return () => {
      clearInterval(interval); // Cleanup interval
      window.removeEventListener('certificateUploaded', handleNewCertificate);
    };
  }, []);

  // Download certificates as Excel file
  const downloadExcel = () => {
    if (certificates.length === 0) {
      alert('No certificates to download.');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(certificates);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'My Certificates');
    XLSX.writeFile(workbook, 'my_certificates.xlsx');
  };

  return (
    <div className="certificates-container">
      <h2>My Uploaded Certificates</h2>

      {loading && <p>Loading certificates...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && certificates.length === 0 ? (
        <p>No certificates uploaded yet.</p>
      ) : (
        <table border="1" width="100%">
          <thead>
            <tr>
              <th>Name</th>
              <th>Registration No.</th>
              <th>Year</th>
              <th>Event Name</th>
              <th>Event Date</th>
              <th>Category</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Certificate</th>
            </tr>
          </thead>
          <tbody>
            {certificates.map((cert) => (
              <tr key={cert._id}>
                <td>{cert.name || 'N/A'}</td>
                <td>{cert.studentRegd || 'N/A'}</td>
                <td>{cert.year || 'N/A'}</td>
                <td>{cert.eventName || 'N/A'}</td>
                <td>{cert.eventDate ? new Date(cert.eventDate).toLocaleDateString() : 'N/A'}</td>
                <td>{cert.category || 'N/A'}</td>
                <td>{cert.phone || 'N/A'}</td>
                <td>{cert.studentEmail || 'N/A'}</td>
                <td>
                  <a href={`http://localhost:5000/${cert.filePath}`} target="_blank" rel="noopener noreferrer">
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div>
        <button onClick={downloadExcel}>Download as Excel</button>
      </div>

      <button onClick={() => navigate('/student-dashboard')} className="back-button">
        Back to Dashboard
      </button>
    </div>
  );
};

export default ViewCertificates;
