# EventShield - Quick Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- **MongoDB** (v4.4 or higher)
- **Git** (for cloning the repository)

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/CatalystsReachOut/Event-Management-Application.git
cd Event-Management-Application
```

### 2. Setup Backend (Server)

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=4000
MONGODB_URL=mongodb://localhost:27017/eventshield
JWT_SECRET=your_super_secure_jwt_secret_key_here_change_this
JWT_EXPIRY=24h
NODE_ENV=development
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
EOF

# Start the server
npm start
```

**Note**: Make sure MongoDB is running before starting the server.

### 3. Setup Frontend

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create .env file (optional)
cat > .env << EOF
REACT_APP_API_URL=http://localhost:4000
EOF

# Start the development server
npm start
```

The frontend should automatically open at `http://localhost:3000`

### 4. Verify Installation

Open your browser and navigate to:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000/api`

## Configuration

### Environment Variables Explained

**Backend (.env in server directory)**:
```bash
PORT=4000                    # Port for backend server
MONGODB_URL=...              # MongoDB connection string
JWT_SECRET=...               # Secret key for JWT signing (CHANGE THIS!)
JWT_EXPIRY=24h              # JWT token expiration time
NODE_ENV=development        # Environment (development/production)
MAIL_HOST=...               # SMTP server for email
MAIL_PORT=587               # SMTP port
MAIL_USER=...               # Email address for sending
MAIL_PASS=...               # Email password/app password
```

**Frontend (.env in frontend directory)**:
```bash
REACT_APP_API_URL=...       # Backend API URL
```

### Database Setup

1. **Install MongoDB** (if not already installed):
   - Windows: Download from https://www.mongodb.com/try/download/community
   - Mac: `brew install mongodb-community`
   - Linux: `sudo apt-get install mongodb`

2. **Start MongoDB**:
   ```bash
   # Windows (as service)
   net start MongoDB
   
   # Mac/Linux
   mongod --dbpath /path/to/data/directory
   ```

3. **Database will be created automatically** when you run the application for the first time.

## First Time Setup

### Create Admin User

After starting the application:

1. **Register a new user** via the signup page
2. **Manually set admin role** in MongoDB:

```javascript
// Connect to MongoDB
mongosh eventshield

// Update user role to admin
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### Enable Two-Factor Authentication

1. Login to your account
2. Navigate to Profile/Security settings
3. Click "Enable 2FA"
4. Scan QR code with Google Authenticator or similar app
5. Enter the 6-digit code to verify
6. Save backup codes securely

## Testing the Security Features

### 1. Test User Registration with Encryption

```bash
curl -X POST http://localhost:4000/api/user/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

### 2. Test Login

```bash
curl -X POST http://localhost:4000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

### 3. Test Login with 2FA

```bash
curl -X POST http://localhost:4000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "twoFactorToken": "123456"
  }'
```

### 4. Test Protected Route

```bash
curl -X GET http://localhost:4000/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 5. Test Admin Route

```bash
curl -X GET http://localhost:4000/api/user/admin/users \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN_HERE"
```

## Troubleshooting

### MongoDB Connection Issues

**Error**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution**:
1. Ensure MongoDB is running: `mongod`
2. Check MongoDB connection string in .env
3. Verify port 27017 is not blocked by firewall

### Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::4000`

**Solution**:
1. Change PORT in server/.env to a different port (e.g., 5000)
2. Or kill the process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :4000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:4000 | xargs kill -9
   ```

### JWT Secret Warning

**Error**: Using default JWT secret

**Solution**:
Generate a secure random string for JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Update .env with the generated string.

### Email Configuration Issues

**Error**: Email not sending for password reset

**Solution**:
1. If using Gmail, enable "Less secure app access" or use App Password
2. Verify MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS in .env
3. Check firewall/antivirus not blocking port 587

### Frontend Can't Connect to Backend

**Error**: Network Error / Failed to fetch

**Solution**:
1. Ensure backend is running on port 4000
2. Check CORS settings in server/app.js
3. Verify REACT_APP_API_URL in frontend/.env

## Development Workflow

### Running Both Frontend and Backend

**Option 1**: Two separate terminals
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

**Option 2**: Using concurrently (from project root)
```bash
npm install -g concurrently
npm start
```

### Watching for Changes

Both frontend and backend have hot-reload enabled:
- Backend: Uses nodemon (restart on file changes)
- Frontend: Create React App dev server (refresh on changes)

## Production Deployment

### Building for Production

```bash
# Build frontend
cd frontend
npm run build

# This creates optimized static files in frontend/build/
```

### Environment Variables for Production

Update server/.env:
```bash
NODE_ENV=production
JWT_SECRET=<use-very-strong-secret>
MONGODB_URL=<production-mongodb-url>
```

### Security Checklist for Production

- [ ] Change JWT_SECRET to strong random value
- [ ] Use HTTPS (SSL/TLS certificates)
- [ ] Set secure cookies (httpOnly, secure, sameSite)
- [ ] Enable rate limiting on API endpoints
- [ ] Configure proper CORS origins
- [ ] Use environment-specific .env files
- [ ] Enable MongoDB authentication
- [ ] Set up regular database backups
- [ ] Configure logging and monitoring
- [ ] Review and test all security features

## Common Commands

### Backend Commands

```bash
# Install dependencies
npm install

# Start server (development)
npm start

# Start with nodemon (auto-restart)
npm run dev

# Run tests
npm test

# Check for security vulnerabilities
npm audit
```

### Frontend Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject (not recommended unless necessary)
npm run eject
```

### Database Commands

```bash
# Connect to MongoDB shell
mongosh eventshield

# View all users
db.users.find().pretty()

# View encryption keys
db.cryptokeys.find().pretty()

# View events
db.events.find().pretty()

# Clear all data (careful!)
db.dropDatabase()
```

## Getting Help

### Documentation

- **Main README**: Comprehensive project overview
- **SECURITY.md**: Detailed security architecture
- **API Documentation**: See routes files in server/routes/

### Common Issues

1. **"Module not found" errors**: Run `npm install` in affected directory
2. **"Cannot connect to MongoDB"**: Ensure MongoDB is running
3. **"Invalid credentials"**: Check email/password, account may be locked
4. **"2FA token invalid"**: Ensure device time is synchronized

### Support

For issues or questions:
1. Check existing documentation
2. Review error logs in console
3. Search closed issues on GitHub
4. Open new issue with detailed description

## Next Steps

After successful setup:

1. **Register users** and test authentication
2. **Enable 2FA** for enhanced security
3. **Create admin user** for management access
4. **Create test events** to verify functionality
5. **Test encryption** by checking database (data should be encrypted)
6. **Review security logs** in application output
7. **Configure email** for password reset functionality
8. **Customize frontend** branding and styling
9. **Set up production** environment
10. **Deploy** to your server

## Additional Resources

- MongoDB Documentation: https://docs.mongodb.com/
- Node.js Documentation: https://nodejs.org/docs/
- React Documentation: https://reactjs.org/docs/
- Express Documentation: https://expressjs.com/
- Mongoose Documentation: https://mongoosejs.com/docs/

---

**EventShield** - Securing Events, Protecting Privacy

For more information, see the main [README.md](README.md) and [SECURITY.md](SECURITY.md).
