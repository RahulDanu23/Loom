# Student Portal

A comprehensive student portal application with features for managing study notes, quizzes, and feedback.

## Features

- Student authentication and profile management
- Study notes upload and management
- Quiz creation and submission
- Feedback system
- Department-wise content organization

## Tech Stack

- Frontend: React.js with Tailwind CSS
- Backend: Node.js with Express
- Database: MongoDB
- Authentication: JWT

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup

1. Navigate to the Server directory:
   ```bash
   cd Server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/student_portal
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the Client directory:
   ```bash
   cd Client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- POST /api/students/register - Register a new student
- POST /api/students/login - Login student
- GET /api/students/profile - Get student profile
- PUT /api/students/profile - Update student profile

### Notes
- GET /api/notes - Get all notes with filters
- GET /api/notes/:id - Get a specific note
- POST /api/notes - Upload a new note
- DELETE /api/notes/:id - Delete a note

### Quizzes
- GET /api/quizzes - Get all quizzes with filters
- GET /api/quizzes/:id - Get a specific quiz
- POST /api/quizzes/:id/submit - Submit quiz answers

### Feedback
- POST /api/feedback - Submit feedback
- GET /api/feedback/my-feedback - Get student's feedback history

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 