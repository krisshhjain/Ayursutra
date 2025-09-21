# AyurSutra Backend API

A comprehensive backend API for the AyurSutra Ayurvedic healthcare platform, providing authentication and user management for both patients and practitioners.

## Features

- **User Authentication**: Login and registration for patients and practitioners
- **JWT Token Security**: Secure authentication with JSON Web Tokens
- **MongoDB Integration**: Robust data storage with Mongoose ODM
- **Role-based Access**: Different user types with specific data fields
- **Password Security**: Bcrypt password hashing
- **Input Validation**: Comprehensive validation using express-validator
- **Security Middleware**: Helmet, CORS, and rate limiting

## Project Structure

```
Backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   └── authController.js    # Authentication logic
├── middleware/
│   ├── auth.js             # JWT authentication middleware
│   └── validation.js       # Input validation rules
├── models/
│   └── User.js             # User schemas (Patient & Practitioner)
├── routes/
│   └── auth.js             # Authentication routes
├── utils/
│   └── jwt.js              # JWT utility functions
├── .env                    # Environment variables
├── package.json            # Dependencies and scripts
└── server.js               # Main server file
```

## API Endpoints

### Authentication Routes (Base URL: `/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | User login | Public |
| GET | `/profile` | Get user profile | Private |
| POST | `/logout` | User logout | Private |

## User Types

### Patient Schema
- **Basic Info**: firstName, lastName, email, mobile, password
- **Personal Details**: age, gender
- **Medical Info**: medicalHistory, allergies, currentMedications
- **Emergency Contact**: name, relationship, phone

### Practitioner Schema
- **Basic Info**: firstName, lastName, email, mobile, password
- **Professional Details**: specialization, experience, qualifications
- **Practice Info**: licenseNumber, consultationFee, availability
- **Verification**: isVerified, rating, totalReviews

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn package manager

### Backend Setup

1. **Navigate to Backend directory**
   ```bash
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   The `.env` file is already configured with your MongoDB connection:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://krishjain710_db_user:iBGyJjjLHcTM6x8M@cluster0.ij5rhmn.mongodb.net/ayursutra?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your_super_secure_jwt_secret_key_change_this_in_production_12345
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:5173
   ```

   **Important**: Change the `JWT_SECRET` to a secure random string in production!

4. **Start the server**
   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

   The server will start on `http://localhost:5000`

### Frontend Integration

The frontend Auth component has been updated to integrate with the backend API. Make sure both frontend and backend are running:

1. **Frontend** (from root directory):
   ```bash
   npm run dev
   ```
   Runs on `http://localhost:5173`

2. **Backend** (from Backend directory):
   ```bash
   npm run dev
   ```
   Runs on `http://localhost:5000`

## API Usage Examples

### User Registration

**Patient Registration:**
```javascript
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@email.com",
  "mobile": "9876543210",
  "password": "SecurePass123",
  "userType": "patient",
  "age": 30,
  "gender": "male"
}
```

**Practitioner Registration:**
```javascript
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "Dr. Jane",
  "lastName": "Smith",
  "email": "dr.jane@email.com",
  "mobile": "9876543210",
  "password": "SecurePass123",
  "userType": "practitioner",
  "specialization": "panchakarma",
  "experience": 10
}
```

### User Login

```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@email.com",
  "password": "SecurePass123",
  "userType": "patient"
}
```

### Authenticated Requests

```javascript
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

## Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "user": { /* user object */ },
    "token": "jwt_token_here"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* validation errors if any */ ]
}
```

## Security Features

- **Password Hashing**: Bcrypt with salt rounds of 12
- **JWT Security**: Secure token generation and verification
- **Input Validation**: Express-validator for all inputs
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configured for frontend origin
- **Helmet Security**: Security headers applied
- **Environment Variables**: Sensitive data in .env file

## Database Schema Validation

- **Email**: Valid email format, unique across user types
- **Mobile**: 10-digit number validation
- **Password**: Minimum 6 characters with uppercase, lowercase, and number
- **Age**: Integer between 1-150 (patients only)
- **Experience**: Non-negative number (practitioners only)

## Testing the API

You can test the API using tools like:
- **Postman**: Import the endpoints and test
- **cURL**: Command-line testing
- **Thunder Client**: VS Code extension
- **Frontend**: Use the integrated Auth component

### Health Check
```bash
GET http://localhost:5000/health
```

## Error Handling

The API includes comprehensive error handling for:
- Validation errors
- Authentication failures
- Database connection issues
- Duplicate user registration
- Invalid user types
- Missing required fields

## Development Notes

- The server runs with `nodemon` in development for auto-restart
- MongoDB connection includes retry logic
- All passwords are hashed before storage
- JWT tokens expire in 7 days (configurable)
- User sessions are stateless (JWT-based)

## Production Considerations

Before deploying to production:

1. **Change JWT_SECRET** to a secure random string
2. **Update FRONTEND_URL** to your production frontend URL
3. **Set NODE_ENV** to "production"
4. **Configure proper MongoDB indexes** for performance
5. **Set up logging** and monitoring
6. **Implement refresh token** mechanism if needed
7. **Add API documentation** with Swagger/OpenAPI

## Support

If you encounter any issues:
1. Check the console logs for detailed error messages
2. Verify MongoDB connection string
3. Ensure all environment variables are set
4. Check network connectivity between frontend and backend

The API is now ready for use with the AyurSutra frontend application!