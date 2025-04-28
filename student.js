const express = require('express');
const Student = require('../models/student');
const multer = require('multer');
const path = require('path');
const Certificate = require('../models/Certificate'); 
const fs = require('fs');
const archiver = require('archiver');
const router = express.Router();

router.get('/details/:email', async (req, res) => {
    try {
        const { email } = req.params;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const student = await Student.findOne({ email });
        if (!student) return res.status(404).json({ message: 'Student not found' });

        res.json(student);
    } catch (error) {
        console.error('Error fetching student details:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/update-details', async (req, res) => {
    try {
        const { email, name, phone, branch, year, section, studentRegd } = req.body;
        const updatedStudent = await Student.findOneAndUpdate(
            { email },
            { name, phone, branch, year, section, studentRegd },
            { new: true }
        );
        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(updatedStudent);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Only PDF files are allowed!'), false);
        }
        cb(null, true);
    }
});

router.post('/upload-certificate', upload.single('certificate'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { name, studentRegd, year, eventName, eventDate, phone, category, studentEmail } = req.body;
        const student = await Student.findOne({ studentRegd });
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const filePath = req.file.path;
        const newCertificate = new Certificate({
            studentId: student._id,
            name,
            studentRegd,
            year,
            eventName,
            eventDate,
            phone,
            category,
            studentEmail,
            fileUrl: `/uploads/${req.file.filename}`,
            filePath: filePath,
            status: 'Pending'
        });

        await newCertificate.save();
        res.json({ message: 'Certificate uploaded successfully!', filePath });
    } catch (error) {
        console.error('Error uploading certificate:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/faculty/certificates/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const certificates = await Certificate.find({ category }).sort({ createdAt: -1 });
        res.json(certificates);
    } catch (error) {
        console.error('Error fetching certificates:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.put('/faculty/certificates/:id/approve', async (req, res) => {
    try {
        const certificate = await Certificate.findByIdAndUpdate(
            req.params.id,
            { status: 'Approved' },
            { new: true }
        );
        if (!certificate) {
            return res.status(404).json({ message: 'Certificate not found' });
        }
        res.json(certificate);
    } catch (error) {
        res.status(500).json({ message: 'Error approving certificate' });
    }
});

router.put('/faculty/certificates/:id/reject', async (req, res) => {
    try {
        const certificate = await Certificate.findByIdAndUpdate(
            req.params.id,
            { status: 'Rejected' },
            { new: true }
        );
        if (!certificate) {
            return res.status(404).json({ message: 'Certificate not found' });
        }
        res.json(certificate);
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting certificate' });
    }
});

router.get('/certificates/regd/:studentRegd', async (req, res) => {
    try {
        const { studentRegd } = req.params;
        const certificates = await Certificate.find({ studentRegd });
        
        if (!certificates.length) {
            return res.status(404).json({ message: 'No certificates found' });
        }
        
        res.json(certificates);
    } catch (error) {
        console.error('Error fetching certificates:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/certificates/:email', async (req, res) => {
    try {
        const certificates = await Certificate.find({ studentEmail: req.params.email });
        
        if (!certificates) {
            return res.status(404).json({ message: 'No certificates found' });
        }
        
        res.json(certificates);
    } catch (error) {
        console.error('Error fetching certificates:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/student/details/:email', async (req, res) => {
    try {
        const student = await Student.findOne({ studentEmail: req.params.email });
        
        if (!student) return res.status(404).json({ message: 'Student not found' });
        
        res.json({
            name: student.name,
            studentRegd: student.studentRegd,
            year: student.year,
            phone: student.phone,
            studentEmail: student.studentEmail
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching student details' });
    }
});
router.get('/faculty/certificates', async (req, res) => {
  try {
      const certificates = await Certificate.find()
          .populate('studentId')
          .sort({ createdAt: -1 });
      res.json(certificates);
  } catch (error) {
      console.error('Error fetching certificates:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.post('/faculty/download-certificates', async (req, res) => {
  try {
    const { certificates } = req.body;
    
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename=certificates.zip'
    });

    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    archive.pipe(res);

    for (const filePath of certificates) {
      const fullPath = path.join(__dirname, '..', filePath);
      if (fs.existsSync(fullPath)) {
        archive.file(fullPath, { name: path.basename(filePath) });
      }
    }

    archive.finalize();
  } catch (error) {
    console.error('Error downloading certificates:', error);
    res.status(500).json({ message: 'Error creating zip file' });
  }
});

router.get('/faculty/certificates', async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate('studentId')
      .sort({ createdAt: -1 });
    res.json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


module.exports = router;