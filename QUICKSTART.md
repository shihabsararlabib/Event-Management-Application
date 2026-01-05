# EventShield - Quick Reference Guide

## 🚀 Quick Start Commands

### Initial Setup
```bash
# Clone and setup
git clone https://github.com/CatalystsReachOut/Event-Management-Application.git
cd Event-Management-Application

# Backend setup
cd server
npm install
echo "PORT=4000
MONGODB_URL=mongodb://localhost:27017/eventshield
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_EXPIRY=24h
NODE_ENV=development" > .env

# Frontend setup
cd ../frontend
npm install

# Start MongoDB
mongod

# Start servers (in separate terminals)
cd server && npm start
cd frontend && npm start
```

## 📝 Testing Commands

### User Registration
```bash
curl -X POST http://localhost:4000/api/user/signup \
  -H "Content-Type: application/json" \
  -d '{"firstname":"John","lastname":"Doe","email":"john@example.com","password":"Secure123!"}'
```

### Login
```bash
curl -X POST http://localhost:4000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Secure123!"}'
```

### Enable 2FA
```bash
curl -X POST http://localhost:4000/api/user/2fa/enable \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Profile
```bash
curl -X GET http://localhost:4000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔐 Security Features Checklist

- [x] RSA 2048-bit encryption (custom)
- [x] ECC secp256k1 encryption (custom)
- [x] SHA-256 password hashing (custom)
- [x] HMAC-SHA256 (custom)
- [x] CBC-MAC (custom)
- [x] TOTP 2FA (custom)
- [x] Multi-level encryption (RSA+ECC)
- [x] Key management system
- [x] Role-based access control
- [x] Secure session management
- [x] Account lockout (5 attempts)
- [x] Session hijacking prevention

## 📊 Project Statistics

- **Security Code**: 3,500+ lines
- **Documentation**: 1,700+ lines
- **Custom Algorithms**: 6 (RSA, ECC, SHA-256, HMAC, CBC-MAC, TOTP)
- **API Endpoints**: 14+
- **Security Modules**: 6 files
- **Models**: 3 (User, Event, CryptoKey)

## 🗂️ Key Files

### Security Implementations
- `server/security/RSAEncryption.js` - RSA 2048-bit
- `server/security/ECCEncryption.js` - ECC secp256k1
- `server/security/PasswordHasher.js` - SHA-256 + salt
- `server/security/MACGenerator.js` - HMAC & CBC-MAC
- `server/security/TwoFactorAuth.js` - TOTP 2FA
- `server/security/KeyManager.js` - Key management

### Models
- `server/models/User.js` - User with security fields
- `server/models/Events.js` - Events with encryption
- `server/models/CryptoKey.js` - Key storage

### Middleware
- `server/middlewares/encryptionService.js` - Multi-level encryption
- `server/middlewares/auth.js` - Authentication & 2FA
- `server/middlewares/rbac.js` - Role-based access

### Controllers
- `server/controllers/userController.js` - User operations

## 📚 Documentation Files

- `README.md` - Project overview (300 lines)
- `SECURITY.md` - Security architecture (1000 lines)
- `SETUP.md` - Installation guide (400 lines)
- `API.md` - API documentation (600 lines)
- `CHANGES.md` - Change summary (500 lines)
- `PROJECT_SUBMISSION.md` - Submission summary

## 🔑 Default Credentials (After Setup)

**First User** (Register via API)
- Email: admin@eventshield.com
- Password: Admin123!

**Set as Admin** (MongoDB command)
```javascript
mongosh eventshield
db.users.updateOne({email:"admin@eventshield.com"},{$set:{role:"admin"}})
```

## 🛠️ Database Commands

### View Users
```javascript
mongosh eventshield
db.users.find().pretty()
```

### View Encryption Keys
```javascript
db.cryptokeys.find().pretty()
```

### View Encrypted Data
```javascript
db.users.findOne({email:"john@example.com"}, {encryptedData:1, dataMac:1})
```

### Set Admin Role
```javascript
db.users.updateOne({email:"user@example.com"},{$set:{role:"admin"}})
```

### Clear Database (Careful!)
```javascript
db.dropDatabase()
```

## 🔍 Verify Security Features

### 1. Check Password Hashing
```javascript
// In MongoDB
db.users.findOne({email:"john@example.com"}, {password:1})
// Should show: salt$iterations$hash format
```

### 2. Check Data Encryption
```javascript
// In MongoDB
db.users.findOne({email:"john@example.com"}, {encryptedData:1})
// Should show encrypted ciphertext
```

### 3. Check MAC
```javascript
// In MongoDB
db.users.findOne({email:"john@example.com"}, {dataMac:1})
// Should show HMAC hash
```

### 4. Check Keys
```javascript
// In MongoDB
db.cryptokeys.find({algorithm:"RSA"}).pretty()
db.cryptokeys.find({algorithm:"ECC"}).pretty()
db.cryptokeys.find({algorithm:"HMAC-SHA256"}).pretty()
```

## 🧪 Test Scenarios

### Scenario 1: User Registration & Login
1. Register user via `/api/user/signup`
2. Check encrypted data in MongoDB
3. Login via `/api/user/login`
4. Verify JWT token received

### Scenario 2: Two-Factor Authentication
1. Login and get token
2. Enable 2FA via `/api/user/2fa/enable`
3. Get QR code data
4. Verify with TOTP code
5. Login again (now requires 2FA)

### Scenario 3: Account Lockout
1. Try login with wrong password 5 times
2. Account should lock for 30 minutes
3. Verify lockout error message

### Scenario 4: Admin Operations
1. Set user as admin in MongoDB
2. Login as admin
3. Access `/api/user/admin/users`
4. View all users
5. Update user role

### Scenario 5: Session Security
1. Login from one browser
2. Copy token
3. Try using token from different IP/browser
4. Should be rejected with security error

## 📈 Performance Benchmarks

### Expected Response Times
- Registration: 150-250ms (key generation + encryption)
- Login: 50-150ms (password verification + session)
- Login with 2FA: 100-200ms (+ TOTP verification)
- Profile retrieval: 100-200ms (decryption + MAC verify)
- Profile update: 150-250ms (re-encryption)

## 🐛 Common Issues & Fixes

### MongoDB Not Running
```bash
# Windows
net start MongoDB

# Mac/Linux
mongod --dbpath /path/to/data
```

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:4000 | xargs kill -9
```

### JWT Secret Warning
```bash
# Generate secure secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2FA Time Sync Issue
- Ensure device time is synchronized
- TOTP depends on accurate time

## 📱 2FA Setup (Google Authenticator)

1. Enable 2FA in EventShield
2. Get QR code data from response
3. Use online QR generator or scan directly
4. Add to Google Authenticator app
5. Enter 6-digit code to verify
6. Save backup codes securely

## 🔄 Key Rotation

### Automatic (Every 30 days)
- Keys automatically expire
- New keys generated on next use
- Old keys retained for 90 days

### Manual (Admin)
```javascript
// In application code
const keyManager = new KeyManager();
keyManager.rotateUserKeys(userId);
```

## 🚨 Security Incidents

### Suspected Account Compromise
1. Revoke all sessions: User model `revokeAllSessions()`
2. Force password reset
3. Review audit logs
4. Rotate keys

### Suspected Key Compromise
1. Revoke affected keys
2. Generate new keys
3. Re-encrypt affected data
4. Investigate breach vector

## 📞 Support & Resources

### Documentation
- README.md - Overview
- SECURITY.md - Architecture
- SETUP.md - Installation
- API.md - API reference

### Testing
- Postman collection (create from API.md)
- cURL examples in API.md
- Browser testing via React app

### Monitoring
- Check server logs for errors
- Monitor MongoDB for data
- Review session activity
- Track failed logins

## 🎓 Academic Use

### For Demonstrations
1. Show custom crypto implementations
2. Demonstrate multi-level encryption
3. Test 2FA functionality
4. Show RBAC in action
5. Demonstrate session security

### For Presentations
1. Architecture diagrams in SECURITY.md
2. Code walkthrough of algorithms
3. Security feature demonstrations
4. Performance metrics
5. Test scenarios

### For Reports
1. Use CHANGES.md for implementation details
2. Reference PROJECT_SUBMISSION.md for checklist
3. Include code snippets from security modules
4. Show test results and screenshots

---

## 🎯 Quick Wins

**5-Minute Demo**:
1. Register user
2. Show encrypted data in MongoDB
3. Login with 2FA
4. Show admin panel

**10-Minute Deep Dive**:
1. Explain RSA implementation
2. Show ECC encryption
3. Demonstrate key management
4. Test session security

**30-Minute Full Presentation**:
1. Project overview
2. Security architecture
3. Algorithm implementations
4. Feature demonstrations
5. Testing and validation
6. Q&A

---

## ✅ Pre-Submission Checklist

- [ ] All code committed to repository
- [ ] README.md updated with project details
- [ ] All security features tested
- [ ] Documentation complete
- [ ] No hardcoded secrets in code
- [ ] .env.example provided
- [ ] Installation instructions verified
- [ ] API endpoints tested
- [ ] Database schemas documented
- [ ] Code comments added

---

**EventShield** - Quick Reference Guide

*For detailed information, see full documentation files*

Last Updated: January 4, 2026
