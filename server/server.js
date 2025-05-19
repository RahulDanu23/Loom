import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/mongodb.js';
import noteRoutes from './routes/noteRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import sendEmail from './config/nodemailer.js';
import authRouter from './Routes/authRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Security & Middleware
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'Accept'],
  credentials: true
};
app.use(cors(corsOptions));

// Test Routes
app.get('/', (req, res) => {
  res.send("API is running...");
});

app.get('/test-email', async (req, res) => {
  try {
    await sendEmail(
      'danurahul67@gmail.com',
      'Test Email',
      'This is a test email',
      '<h1>This is a test email</h1>'
    );
    res.send('Test email sent successfully!');
  } catch (error) {
    console.error('Email error:', error.message);
    res.status(500).send('Failed to send test email: ' + error.message);
  }
});

// API Routes
app.use('/api/auth', authRouter); // Added Authentication Routes
app.use('/api/notes', noteRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);

// Error Handling Middleware
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Not Found'
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error'
  });
});

// Start Server
const startServer = async () => {
  try {
    const dbConnected = await connectDB();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`CORS allowed origin: ${corsOptions.origin}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();