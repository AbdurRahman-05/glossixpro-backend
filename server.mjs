import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import { Resend } from 'resend';
import { v2 as cloudinary } from 'cloudinary';

// Models
import PageContent from './models/PageContent.js';
import Job from './models/Job.js';
import Image from './models/Image.js';
import Service from './models/Service.js';
import User from './models/User.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://glossixproweb_db_user:gMgocUEhZ5VonPv5@cluster0.8f39li6.mongodb.net/?appName=Cluster0';

if (!process.env.MONGO_URI || MONGO_URI === 'mongodb+srv://glossixproweb_db_user:gMgocUEhZ5VonPv5@cluster0.8f39li6.mongodb.net/?appName=Cluster0') {
  console.warn('⚠️  WARNING: MONGO_URI not set in .env file. Using default local MongoDB connection.');
  console.warn('⚠️  Please create a .env file with your MongoDB connection string.');
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('💡 Please check your MongoDB connection string in .env file');
    process.exit(1);
  });

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

// Error handling middleware
const handleAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// API Routes

// Jobs
app.get('/api/jobs', handleAsync(async (req, res) => {
  const jobs = await Job.find().sort({ createdAt: -1 });
  res.json(jobs);
}));

app.post('/api/jobs', handleAsync(async (req, res) => {
  const { title, location, description } = req.body;

  if (!title || !location || !description) {
    return res.status(400).json({
      error: 'Missing required fields: title, location, and description are required'
    });
  }

  const newJob = new Job({ title, location, description });
  await newJob.save();
  res.status(201).json(newJob);
}));

app.put('/api/jobs/:id', handleAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid job ID format' });
  }

  const updatedJob = await Job.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedJob) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json(updatedJob);
}));

app.delete('/api/jobs/:id', handleAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid job ID format' });
  }

  const deletedJob = await Job.findByIdAndDelete(id);

  if (!deletedJob) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json({ message: 'Job deleted successfully', id });
}));

// Images
app.get('/api/images', handleAsync(async (req, res) => {
  const { category } = req.query;
  const query = category ? { category } : {};
  const images = await Image.find(query).sort({ createdAt: -1 });
  res.json(images);
}));

app.get('/api/images/:category', handleAsync(async (req, res) => {
  const { category } = req.params;
  const images = await Image.find({ category }).sort({ createdAt: -1 });
  res.json(images);
}));

app.post('/api/images', handleAsync(async (req, res) => {
  const { category, src, alt } = req.body;

  if (!category || !src) {
    return res.status(400).json({
      error: 'Missing required fields: category and src are required'
    });
  }

  const newImage = new Image({ category, src, alt: alt || '' });
  await newImage.save();
  res.status(201).json(newImage);
}));

app.put('/api/images/:id', handleAsync(async (req, res) => {
  const { id } = req.params;
  const { src, alt, category } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid image ID format' });
  }

  const updatedImage = await Image.findByIdAndUpdate(
    id,
    { src, alt, category },
    { new: true, runValidators: true }
  );

  if (!updatedImage) {
    return res.status(404).json({ error: 'Image not found' });
  }

  res.json(updatedImage);
}));

app.delete('/api/images/:id', handleAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid image ID format' });
  }

  const deletedImage = await Image.findByIdAndDelete(id);

  if (!deletedImage) {
    return res.status(404).json({ error: 'Image not found' });
  }

  // Optionally delete the physical file if it exists
  if (deletedImage.src && deletedImage.src.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, 'public', deletedImage.src);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  res.json({ message: 'Image deleted successfully', id });
}));


// Services
app.get('/api/services', handleAsync(async (req, res) => {
  const services = await Service.find().sort({ createdAt: -1 });
  res.json(services);
}));

app.post('/api/services', handleAsync(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      error: 'Missing required fields: title and description are required'
    });
  }

  const newService = new Service({ title, description });
  await newService.save();
  res.status(201).json(newService);
}));

app.put('/api/services/:id', handleAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid service ID format' });
  }

  const updatedService = await Service.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedService) {
    return res.status(404).json({ error: 'Service not found' });
  }

  res.json(updatedService);
}));

app.delete('/api/services/:id', handleAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid service ID format' });
  }

  const deletedService = await Service.findByIdAndDelete(id);

  if (!deletedService) {
    return res.status(404).json({ error: 'Service not found' });
  }

  res.json({ message: 'Service deleted successfully', id });
}));

// Page Content
app.get('/api/pages/:pageId', handleAsync(async (req, res) => {
  const { pageId } = req.params;
  const pageContent = await PageContent.findOne({ pageId });
  res.json(pageContent ? pageContent.content : {});
}));

app.post('/api/pages/:pageId', handleAsync(async (req, res) => {
  const { pageId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const updatedPage = await PageContent.findOneAndUpdate(
    { pageId },
    {
      $set: { content },
      // $set: { lastUpdatedBy: req.user._id } // TODO: Add auth middleware to get user
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.json(updatedPage.content);
}));

// Users (for login)
app.post('/api/login', handleAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Missing required fields: email and password are required'
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Compare hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.json({
    message: 'Login successful',
    user: {
      id: user._id,
      email: user.email
    }
  });
}));

// User Registration
app.post('/api/register', handleAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Missing required fields: email and password are required'
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const newUser = new User({ email, password });
  await newUser.save();

  res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: newUser._id,
      email: newUser.email
    }
  });
}));

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Check Cloudinary configuration
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('⚠️  WARNING: Cloudinary credentials not set in .env file.');
  console.warn('⚠️  Image uploads will fail. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env');
} else {
  console.log('✅ Cloudinary configured successfully');
}

// File Upload with Cloudinary
// Use multer memory storage to handle file in memory before uploading to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  }
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(503).json({
        error: 'Image upload service not configured',
        message: 'Please contact administrator to configure Cloudinary'
      });
    }

    // Upload to Cloudinary using upload_stream
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'glossixpro/gallery', // Organize images in a folder
          resource_type: 'auto',
          transformation: [
            { quality: 'auto:good' }, // Automatic quality optimization
            { fetch_format: 'auto' }  // Automatic format selection (WebP when supported)
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Pipe the buffer to Cloudinary
      uploadStream.end(req.file.buffer);
    });

    const result = await uploadPromise;

    res.json({
      url: result.secure_url, // HTTPS URL from Cloudinary
      filename: result.public_id,
      category: req.body.category || 'general'
    });
  } catch (error) {
    console.error('❌ Error uploading to Cloudinary:', error);
    res.status(500).json({
      error: 'Failed to upload image',
      details: error.message
    });
  }
});



// Initialize Resend instances
let resendContact = null;
let resendJobs = null;

if (process.env.RESEND_API_KEY_CONTACT) {
  resendContact = new Resend(process.env.RESEND_API_KEY_CONTACT);
  console.log('✅ Resend (Contact) initialized');
} else {
  console.warn('⚠️  RESEND_API_KEY_CONTACT not configured. Contact form emails will be disabled.');
}

if (process.env.RESEND_API_KEY_JOBS) {
  resendJobs = new Resend(process.env.RESEND_API_KEY_JOBS);
  console.log('✅ Resend (Jobs) initialized');
} else {
  console.warn('⚠️  RESEND_API_KEY_JOBS not configured. Job application emails will be disabled.');
}


// Contact Form Endpoint
app.post('/api/contact', handleAsync(async (req, res) => {
  try {
    const { name, email, businessName, phoneNumber, howCanWeHelp, bestTimeToContact, message } = req.body;

    // Check if email is configured
    if (!resendContact) {
      console.warn('⚠️  Email not sent: Resend (Contact) not configured');
      return res.status(503).json({
        error: 'Email service not configured',
        message: 'Contact form submission received but email could not be sent. Please contact the administrator.'
      });
    }

    console.log('Attempting to send email from:', email);

    const { data, error } = await resendContact.emails.send({
      from: 'Glossix Pro <onboarding@resend.dev>',
      replyTo: email,
      to: 'info.glossixpro@gmail.com', // Matches RESEND_API_KEY_CONTACT registration
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h3>New Contact Request</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Business Name:</strong> ${businessName}</p>
        <p><strong>Phone:</strong> ${phoneNumber}</p>
        <p><strong>Topic:</strong> ${howCanWeHelp}</p>
        <p><strong>Best Time to Contact:</strong> ${bestTimeToContact}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    if (error) {
      console.error('❌ Error sending email:', JSON.stringify(error, null, 2));
      return res.status(500).json({
        error: 'Failed to send email',
        details: error.message,
        code: error.name // Resend often returns error name/code
      });
    }

    console.log('✅ Email sent successfully:', data.id);
    res.json({ message: 'Email sent successfully', messageId: data.id });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    res.status(500).json({
      error: 'Failed to send email',
      details: error.message
    });
  }
}));


// Career Application Endpoint
app.post('/api/career/apply', upload.single('resume'), handleAsync(async (req, res) => {
  try {
    const { name, email, phone, jobTitle } = req.body;
    const resumeFile = req.file;

    if (!resumeFile) {
      return res.status(400).json({ error: 'Resume file is required' });
    }

    // Check if email is configured
    if (!resendJobs) {
      console.warn('⚠️  Application received but email not sent: Resend (Jobs) not configured');
      return res.status(503).json({
        error: 'Email service not configured',
        message: 'Application received but email could not be sent. Please contact the administrator.'
      });
    }

    console.log('Attempting to send job application email from:', email);

    // Convert the resume buffer to base64 (file is in memory, not on disk)
    const resumeBase64 = resumeFile.buffer.toString('base64');

    const { data, error } = await resendJobs.emails.send({
      from: 'Glossix Pro <onboarding@resend.dev>',
      replyTo: email,
      to: 'jobs.glossixpro@gmail.com', // Matches RESEND_API_KEY_JOBS registration
      subject: `New Job Application: ${jobTitle} - ${name}`,
      html: `
        <h3>New Job Application</h3>
        <p><strong>Job Title:</strong> ${jobTitle}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
      `,
      attachments: [
        {
          filename: resumeFile.originalname,
          content: resumeBase64,
        },
      ],
    });

    if (error) {
      console.error('❌ Error sending job application email:', JSON.stringify(error, null, 2));
      return res.status(500).json({
        error: 'Failed to submit application',
        details: error.message,
        code: error.name
      });
    }

    console.log('✅ Job application email sent successfully:', data.id);

    // Clean up uploaded resume after sending? 
    // Maybe keep it for record. For now, we leave it in uploads.

    res.json({ message: 'Application submitted successfully', messageId: data.id });
  } catch (error) {
    console.error('❌ Error sending job application email:', error);
    res.status(500).json({
      error: 'Failed to submit application',
      details: error.message
    });
  }
}));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
