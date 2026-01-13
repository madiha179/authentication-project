Authentication Project
Project Overview

This project is a secure user authentication system built with Node.js, Express.js, and MongoDB. It provides a robust backend API for user management, including signup, login, logout, password reset, and OTP verification. The project was developed as part of a graduation project to demonstrate practical backend development and API security skills.

Features

User Registration & Login: Users can sign up and log in securely.

JWT Authentication: Access and refresh tokens are used for secure sessions.

Logout: Invalidate sessions and tokens upon logout.

Forgot Password & Reset: Users can reset their password using a secure token and OTP sent via email.

OTP Verification: Email-based OTP system for enhanced security.

Password Security: Passwords are hashed using bcrypt.

Protected Routes: Middleware ensures that only authenticated users can access protected endpoints.

Technologies Used

Node.js & Express.js for backend API development.

MongoDB & Mongoose for data storage and schema management.

JWT (JSON Web Tokens) for authentication and authorization.

bcrypt.js for password hashing.

Nodemailer / Email Service for OTP delivery.

TypeScript for type safety and code reliability.

API Endpoints

POST /api/v1/users/signup - Register a new user.

POST /api/v1/users/login - Authenticate a user and return access & refresh tokens.

POST /api/v1/users/logout - Logout user and invalidate token.

POST /api/v1/users/forgotpassword - Request password reset and send OTP via email.

PATCH /api/v1/users/resetpassword/:token - Reset password with valid token and OTP.

POST /api/v1/auth/refreshtoken - Refresh Access Token

Key Learnings

Implemented secure authentication workflows using JWT and refresh tokens.

Learned to integrate email-based OTP verification for sensitive operations.

Gained experience in backend API design, error handling, and middleware usage.

Improved TypeScript skills in a Node.js environment for type safety.

Installation

Clone the repository:

git clone <repository-url>


Install dependencies:

npm install


Configure environment variables (.env) with:

DATABASE=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRESIN=15m
REFRESH_TOKEN=<your-refresh-token-secret>
REFRESH_TOKEN_EXPIRESIN=7d
EMAIL=<your-email>
EMAIL_PASSWORD=<your-email-password>


Start the server:

npm run dev
