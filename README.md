# EventShield - Secure Event Registration & Attendance System

**A highly secure, end-to-end encrypted event management platform built with the MERN stack**

## 🔐 Project Overview

EventShield is a web-based platform designed for managing university and community events with robust, military-grade security guarantees. The system enables participants to securely register for events, view encrypted tickets, and track attendance, while organizers can create events, manage participant lists, and record attendance with complete confidence in data security.

EventShield was developed as part of the CSE447 Cryptography & Network Security course project, implementing advanced cryptographic techniques from scratch without relying on built-in encryption libraries.

## 🛡️ Core Security Features

### 1. **Custom Encryption Algorithms (Implemented from Scratch)**
- **RSA Encryption**: 2048-bit RSA implementation with custom key generation, encryption, and decryption
- **ECC Encryption**: Elliptic Curve Cryptography using secp256k1 curve
- **Multi-Level Encryption**: Data is encrypted with RSA, then re-encrypted with ECC for enhanced confidentiality
- **No Built-in Crypto Libraries**: All encryption algorithms implemented from first principles

### 2. **Advanced Authentication System**
- **Two-Factor Authentication (2FA)**: TOTP-based authentication with backup codes
- **Custom Password Hashing**: SHA-256 based password hashing with salt and key stretching (PBKDF2-like approach)
- **Account Lockout**: Automatic account locking after 5 failed login attempts
- **Secure Session Management**: IP and user-agent validation to prevent session hijacking

### 3. **Data Integrity & Authentication**
- **HMAC-SHA256**: Message authentication codes for data integrity verification
- **CBC-MAC**: Alternative MAC implementation for data authentication
- **Timestamped MACs**: Protection against replay attacks
- **Automatic Verification**: All encrypted data is verified before decryption

### 4. **Comprehensive Key Management**
- **Automated Key Generation**: RSA, ECC, and MAC keys generated per user
- **Key Rotation**: Automatic key expiration and rotation after 30 days
- **Secure Key Storage**: Keys stored encrypted in database with access controls
- **Key Revocation**: Support for emergency key revocation

### 5. **Role-Based Access Control (RBAC)**
- **Admin Role**: Full system access including user management, event creation, and attendance tracking
- **User Role**: Limited to event registration, ticket viewing, and profile management
- **Permission-Based System**: Granular permissions for specific operations
- **Access Auditing**: All privileged operations are logged

### 6. **Automatic Data Encryption**
- **User Information**: All personal data encrypted before database storage
- **Event Details**: Event information and participant lists encrypted
- **Ticket Data**: Each ticket contains encrypted user and event information
- **Transparent Decryption**: Data automatically decrypted upon authorized retrieval

### 7. **Secure Session Management**
- **Session Tracking**: Each login creates a tracked session with metadata
- **Multi-Session Support**: Users can manage multiple active sessions
- **Session Validation**: Continuous validation of IP address and user agent
- **Emergency Logout**: Ability to revoke all sessions simultaneously

### 8. **Security Monitoring & Logging**
- **Failed Login Tracking**: Monitors and responds to failed authentication attempts
- **Last Login Tracking**: Records timestamp of last successful login
- **Password Change History**: Tracks when passwords were last modified
- **Security Audit Trail**: Comprehensive logging of security-critical operations

## 🏗️ System Architecture

```
EventShield/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Application pages
│   │   └── features/        # Redux slices
│   └── public/
├── server/                   # Node.js/Express backend
│   ├── security/            # Custom cryptography implementations
│   │   ├── RSAEncryption.js        # RSA from scratch
│   │   ├── ECCEncryption.js        # ECC from scratch
│   │   ├── PasswordHasher.js       # Custom password hashing
│   │   ├── MACGenerator.js         # HMAC & CBC-MAC
│   │   ├── TwoFactorAuth.js        # TOTP 2FA implementation
│   │   └── KeyManager.js           # Key lifecycle management
│   ├── models/              # MongoDB schemas
│   │   ├── User.js                 # User model with security fields
│   │   ├── Events.js               # Event model with encryption
│   │   └── CryptoKey.js            # Key storage model
│   ├── controllers/         # Business logic
│   ├── middlewares/         # Auth, RBAC, encryption services
│   └── routes/              # API endpoints
└── README.md
```

## 🔧 Technical Implementation Details

### Encryption Flow

**Registration & Data Storage:**
1. User submits registration data
2. Password is hashed with custom SHA-256 + salt
3. User information is encrypted with RSA (Layer 1)
4. RSA-encrypted data is re-encrypted with ECC (Layer 2)
5. HMAC is generated for encrypted data
6. All encrypted data and MAC stored in database

**Login & Data Retrieval:**
1. User submits credentials
2. Password hash is verified
3. 2FA token validated (if enabled)
4. Session created with IP and user-agent binding
5. User data retrieved and MAC verified
6. Data decrypted: ECC decryption → RSA decryption
7. Decrypted data sent to authorized user

### Key Management Workflow

1. **Key Generation**: Upon user registration, RSA, ECC, and MAC keys are automatically generated
2. **Key Storage**: Keys stored in dedicated CryptoKey collection with expiration dates
3. **Key Usage**: Retrieved on-demand for encryption/decryption operations
4. **Key Rotation**: Background job checks for expired keys and generates new ones
5. **Key Revocation**: Admin can revoke keys in case of security incident

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=4000
MONGODB_URL=mongodb://localhost:27017/eventshield
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRY=24h
NODE_ENV=development
EOF

# Start server
npm start
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

## 🔑 API Endpoints

### Authentication & User Management

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| POST | `/api/user/signup` | Register new user | No | - |
| POST | `/api/user/login` | Login with credentials | No | - |
| POST | `/api/user/logout` | Logout and revoke session | Yes | - |
| GET | `/api/user/profile` | Get user profile (decrypted) | Yes | - |
| PUT | `/api/user/update` | Update user details | Yes | - |
| POST | `/api/user/password/change` | Change password | Yes | - |
| POST | `/api/user/forgotPassword` | Request password reset | No | - |

### Two-Factor Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/user/2fa/enable` | Enable 2FA and get QR code | Yes |
| POST | `/api/user/2fa/verify` | Verify and activate 2FA | Yes |
| POST | `/api/user/2fa/disable` | Disable 2FA | Yes |

### Event Management

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/event` | List all events | No | - |
| GET | `/api/event/:id` | Get event details | No | - |
| POST | `/api/event` | Create new event | Yes | Admin |
| PUT | `/api/event/:id` | Update event | Yes | Admin |
| DELETE | `/api/event/:id` | Delete event | Yes | Admin |
| POST | `/api/event/:id/register` | Register for event | Yes | - |
| GET | `/api/user/events/registered` | Get user's registered events | Yes | - |

### Admin Operations

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/user/admin/users` | List all users | Yes | Admin |
| GET | `/api/user/admin/user/:id` | Get user details | Yes | Admin |
| PUT | `/api/user/admin/user/:id/role` | Update user role | Yes | Admin |
| DELETE | `/api/user/admin/user/:id` | Delete user | Yes | Admin |

## 🧪 Testing Security Features

### Test User Registration with Encryption
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

### Test Login with 2FA
```bash
curl -X POST http://localhost:4000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "twoFactorToken": "123456"
  }'
```

### Test Session Security
```bash
# Login creates a session tied to IP and user-agent
# Attempting to use same token from different IP/browser will be rejected
```

## 🔒 Security Best Practices Implemented

1. **No Plaintext Storage**: All sensitive data encrypted at rest
2. **Defense in Depth**: Multiple layers of encryption and authentication
3. **Principle of Least Privilege**: RBAC ensures users have minimal required access
4. **Secure by Default**: 2FA encouraged, automatic key rotation enabled
5. **Audit Trail**: All security events logged for forensic analysis
6. **Session Security**: Continuous validation prevents hijacking
7. **Password Security**: Custom hashing with salt and key stretching
8. **Data Integrity**: MAC verification on all encrypted data
9. **Key Management**: Proper key lifecycle from generation to revocation
10. **Zero Trust**: Every request authenticated and authorized

## 📚 Academic Requirements Fulfilled

✅ **Login & Registration**: Custom implementation with secure authentication  
✅ **Data Encryption at Rest**: All user data encrypted before storage  
✅ **Password Hashing & Salting**: Custom SHA-256 based implementation  
✅ **Two-Factor Authentication**: TOTP-based 2FA with backup codes  
✅ **Key Management Module**: Complete key lifecycle management  
✅ **Data Encryption/Decryption**: Automatic encryption on storage, decryption on retrieval  
✅ **Encrypted Database**: All sensitive data stored in encrypted form  
✅ **MAC Implementation**: HMAC-SHA256 and CBC-MAC for integrity  
✅ **Asymmetric Encryption Only**: RSA and ECC (no symmetric encryption)  
✅ **Multi-Level Encryption**: RSA + ECC double encryption (Optional requirement)  
✅ **RBAC**: Admin and user roles with distinct privileges  
✅ **Secure Session Management**: Token security and hijacking prevention  
✅ **No Built-in Crypto**: All algorithms implemented from scratch  

## 👥 Contributors

- **Original Project**: CatalystsReachOut Team (Priyansh, Vaibhav, Smita, Sitanshu, Prasad)
- **Security Enhancement**: CSE447 Lab Project Team

## 📄 License

ISC License - See LICENSE file for details

## 🔗 Links

- GitHub Repository: [Event-Management-Application](https://github.com/CatalystsReachOut/Event-Management-Application)
- Course: CSE447 - Cryptography & Network Security

## ⚠️ Disclaimer

This project is developed for educational purposes as part of a university course. While it implements genuine cryptographic algorithms, it should undergo professional security audit before production deployment.

---

**EventShield** - *Securing Events, Protecting Privacy*
