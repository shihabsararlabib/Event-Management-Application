# EventShield Security Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Cryptographic Implementations](#cryptographic-implementations)
3. [Authentication System](#authentication-system)
4. [Key Management](#key-management)
5. [Data Protection](#data-protection)
6. [Access Control](#access-control)
7. [Session Security](#session-security)
8. [API Security](#api-security)

---

## Overview

EventShield implements military-grade security through custom cryptographic algorithms built from scratch, without relying on built-in encryption libraries. The system provides end-to-end encryption, multi-factor authentication, and comprehensive access controls.

## Cryptographic Implementations

### 1. RSA Encryption (2048-bit)

**Implementation Location**: `server/security/RSAEncryption.js`

**Key Features**:
- Custom prime number generation using Miller-Rabin primality test
- Modular exponentiation for encryption/decryption
- Extended Euclidean algorithm for modular inverse calculation
- Support for long message encryption through block processing

**Key Generation Process**:
```javascript
1. Generate two large prime numbers (p, q) of 1024 bits each
2. Calculate n = p * q (2048-bit modulus)
3. Calculate φ(n) = (p-1)(q-1)
4. Choose e = 65537 (public exponent)
5. Calculate d = e^-1 mod φ(n) (private exponent)
```

**Encryption**: C = M^e mod n  
**Decryption**: M = C^d mod n

**Security Properties**:
- 2048-bit key size provides ~112 bits of security
- Resistant to known factorization attacks
- Proper padding prevents deterministic encryption

### 2. ECC Encryption (secp256k1 curve)

**Implementation Location**: `server/security/ECCEncryption.js`

**Curve Parameters**:
- Prime: 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F
- Curve equation: y² = x³ + 7
- Generator point G with order n

**Key Features**:
- Point addition and doubling on elliptic curve
- Scalar multiplication using binary method
- ECIES (Elliptic Curve Integrated Encryption Scheme)
- Digital signature generation and verification

**Encryption Process**:
```javascript
1. Generate ephemeral key pair (r, R=rG)
2. Calculate shared secret S = rQ (where Q is recipient's public key)
3. Derive encryption key from S.x coordinate
4. Encrypt message: C = M ⊕ key
5. Return (R, C) as ciphertext
```

**Security Properties**:
- 256-bit key provides ~128 bits of security
- Smaller key sizes compared to RSA for equivalent security
- Fast computation for encryption/decryption

### 3. Password Hashing

**Implementation Location**: `server/security/PasswordHasher.js`

**Algorithm**: Custom PBKDF2-like implementation with SHA-256

**Process**:
```javascript
1. Generate random 32-character salt
2. Combine password + salt
3. Apply SHA-256 hash iteratively (10,000 iterations)
4. Store: salt$iterations$hash
```

**SHA-256 Implementation**:
- Full implementation of FIPS 180-4 standard
- 512-bit block processing
- 32-bit word operations (AND, OR, XOR, rotation)
- 64 rounds of compression function

**Security Properties**:
- Key stretching through 10,000 iterations
- Unique salt per password prevents rainbow table attacks
- Constant-time comparison prevents timing attacks

### 4. Message Authentication Codes (MAC)

**Implementation Location**: `server/security/MACGenerator.js`

#### HMAC-SHA256

**Algorithm**: HMAC as specified in RFC 2104

**Process**:
```javascript
1. Pad key to block size (64 bytes)
2. Create inner key: ikey = key ⊕ 0x36 (repeated)
3. Create outer key: okey = key ⊕ 0x5c (repeated)
4. Compute: HMAC = H(okey || H(ikey || message))
```

**Security Properties**:
- Provides data integrity and authenticity
- Collision-resistant due to SHA-256
- Secure against length extension attacks

#### CBC-MAC

**Algorithm**: Simplified CBC-MAC for comparison

**Process**:
```javascript
1. Pad message to multiple of block size
2. Initialize CBC state with zeros
3. For each block:
   - XOR block with CBC state
   - Encrypt result with key
4. Return final CBC state as MAC
```

**Security Properties**:
- Fixed-length message authentication
- Protects against tampering
- Used as alternative to HMAC

### 5. Multi-Level Encryption

**Implementation**: Combination of RSA and ECC

**Encryption Flow**:
```javascript
1. Original Data → RSA Encryption → RSA Ciphertext
2. RSA Ciphertext → ECC Encryption → Final Ciphertext
3. Generate HMAC of Final Ciphertext
4. Store: {ciphertext, mac}
```

**Decryption Flow**:
```javascript
1. Verify HMAC of stored ciphertext
2. Final Ciphertext → ECC Decryption → RSA Ciphertext
3. RSA Ciphertext → RSA Decryption → Original Data
```

**Security Advantage**:
- Defense in depth: Breaking both RSA and ECC required
- Different mathematical foundations (factorization vs. discrete log)
- Future-proof against algorithm-specific attacks

---

## Authentication System

### 1. User Registration

**Process**:
```javascript
1. Validate input (email, password requirements)
2. Check for existing user
3. Hash password with custom hasher (SHA-256 + salt + 10k iterations)
4. Create user record in database
5. Generate encryption keys (RSA, ECC, MAC)
6. Encrypt user data with multi-level encryption
7. Generate HMAC for encrypted data
8. Store encrypted data and HMAC
```

**Security Checks**:
- Email format validation
- Password strength requirements (minimum 6 characters)
- Duplicate email prevention
- Automatic key generation

### 2. Login Process

**Standard Login**:
```javascript
1. Receive credentials (email, password)
2. Find user by email
3. Check if account locked (5 failed attempts = 30 min lock)
4. Verify password hash
5. If incorrect: increment failed attempts, lock if threshold reached
6. If correct: reset failed attempts
7. Check if 2FA enabled
8. Create secure session with IP and user-agent binding
9. Generate JWT token
10. Set secure HTTP-only cookie
11. Return token and user info
```

**With 2FA**:
```javascript
6. Request 2FA token
7. Verify TOTP token against user's secret
8. If invalid: check backup codes
9. If backup code used: remove from list
10. Continue with session creation
```

**Failed Login Handling**:
- Track failed attempts per user
- Lock account after 5 failed attempts for 30 minutes
- Return remaining attempts to user
- Log security events

### 3. Two-Factor Authentication (2FA)

**TOTP Implementation**: Time-based One-Time Password (RFC 6238)

**Setup Process**:
```javascript
1. User requests 2FA enablement
2. Generate random 32-character base32 secret
3. Generate QR code data (otpauth:// URL)
4. Generate 10 backup codes (8 digits each, formatted XXXX-XXXX)
5. Return secret, QR data, and backup codes to user
6. User scans QR with authenticator app
7. User submits first TOTP token for verification
8. If valid: enable 2FA, store secret and backup codes
```

**TOTP Generation**:
```javascript
1. Get current Unix time
2. Calculate time step: T = floor(time / 30 seconds)
3. Convert T to 8-byte big-endian array
4. Compute HMAC-SHA1(secret, T)
5. Apply dynamic truncation to get 31-bit value
6. Take modulo 10^6 to get 6-digit code
7. Pad with leading zeros if necessary
```

**Verification**:
```javascript
1. Calculate TOTP for current time window
2. Calculate TOTP for ±1 time window (30 seconds before/after)
3. Compare submitted token with all three
4. If match: authentication successful
5. If no match: try backup codes
6. If backup code valid: remove from list and accept
```

**Security Features**:
- 30-second time window reduces replay risk
- Backup codes for emergency access
- Each backup code single-use only
- Base32 encoding for easy manual entry

---

## Key Management

**Implementation Location**: `server/security/KeyManager.js`, `server/models/CryptoKey.js`

### Key Lifecycle

#### 1. Key Generation

**Automatic Generation on User Registration**:
```javascript
For each user:
  1. Generate 2048-bit RSA key pair
     - Store public key: {e, n}
     - Store private key: {d, n}
  
  2. Generate ECC key pair (secp256k1)
     - Store public key: {x, y} coordinates
     - Store private key: scalar value
  
  3. Generate 64-character MAC key
     - Random alphanumeric string
  
  4. Set expiration: 30 days from creation
  5. Mark as 'active' status
  6. Store in CryptoKey collection
```

#### 2. Key Storage

**Database Schema**:
```javascript
{
  userId: ObjectId,           // Reference to user
  keyId: String,             // Unique identifier
  algorithm: String,         // 'RSA', 'ECC', or 'HMAC-SHA256'
  publicKey: String,         // JSON string (for RSA/ECC)
  privateKey: String,        // JSON string (encrypted)
  key: String,              // For MAC keys
  status: String,           // 'active', 'expired', 'revoked'
  createdAt: Date,
  expiresAt: Date,
  expiredAt: Date,          // When status changed to expired
  revokedAt: Date           // When status changed to revoked
}
```

**Security Measures**:
- Private keys stored as JSON strings
- Separate collection from user data
- Indexed by userId and status for fast queries
- Expiration timestamps for automatic rotation

#### 3. Key Retrieval

**On-Demand Loading**:
```javascript
async getUserKeys(userId):
  1. Query CryptoKey collection for active keys
  2. If not found: generate new keys
  3. Parse JSON strings back to key objects
  4. Convert string representations to BigInt for computation
  5. Return key structures for encryption/decryption
```

**Caching Strategy**:
- Keys loaded when needed for crypto operations
- Not cached in memory for security
- Fresh query ensures latest key status

#### 4. Key Rotation

**Automatic Rotation** (Every 30 days):
```javascript
rotateUserKeys(userId):
  1. Find all active keys for user
  2. Mark status as 'expired'
  3. Set expiredAt timestamp
  4. Generate new key set
  5. Mark new keys as 'active'
  6. Re-encrypt user data with new keys
```

**Manual Rotation** (Admin trigger):
```javascript
Admin can force rotation:
  - Security incident
  - Key compromise suspected
  - User request
  - Policy requirement
```

#### 5. Key Revocation

**Immediate Revocation**:
```javascript
revokeKey(keyId):
  1. Find key by keyId
  2. Set status to 'revoked'
  3. Set revokedAt timestamp
  4. Key no longer usable for operations
  5. Generate replacement keys
```

**Reasons for Revocation**:
- Security breach detected
- User account compromised
- Private key exposure suspected
- Regulatory requirement

#### 6. Key Cleanup

**Expired Key Retention**:
```javascript
clearExpiredKeys():
  1. Find keys with status='expired'
  2. Check if expired > 90 days ago
  3. If yes: permanently delete from database
  4. Retain recent expired keys for data recovery
```

**Retention Policy**:
- Active keys: indefinite
- Expired keys: 90 days
- Revoked keys: 90 days
- Allows data recovery within window

### Key Distribution

**Public Key Export**:
```javascript
exportPublicKeys(userId):
  1. Query active RSA and ECC keys
  2. Extract public key components only
  3. Return {keyId, algorithm, publicKey, createdAt, expiresAt}
  4. Private keys never exported
```

**Use Cases**:
- Sharing public keys with other users
- Key verification
- API integrations
- Third-party encryption

---

## Data Protection

### Automatic Encryption Service

**Implementation Location**: `server/middlewares/encryptionService.js`

#### Encryption Flow

**User Data Encryption**:
```javascript
encryptUserInfo(user):
  1. Extract sensitive fields: {firstname, lastname, email}
  2. Convert to JSON string
  3. Get user's active RSA keys
  4. RSA encrypt entire JSON (may split into blocks)
  5. Get user's active ECC keys
  6. ECC encrypt the RSA ciphertext
  7. Get user's MAC key
  8. Generate HMAC of ECC ciphertext
  9. Store: {ciphertext: eccCiphertext, mac: hmac}
  10. Save to user.encryptedData field
```

**Event Data Encryption**:
```javascript
encryptEventData(event, creatorId):
  1. Extract event details
  2. Include participant information
  3. Apply multi-level encryption (RSA → ECC)
  4. Generate MAC
  5. Store encrypted data in event.encryptedData
```

#### Decryption Flow

**Data Retrieval**:
```javascript
decryptData(encryptedData, userId):
  1. Get user's MAC key
  2. Verify HMAC: compare stored MAC with computed MAC
  3. If verification fails: throw integrity error
  4. Get user's ECC keys
  5. ECC decrypt ciphertext → RSA ciphertext
  6. Get user's RSA keys
  7. RSA decrypt RSA ciphertext → original data
  8. Parse JSON and return plaintext
```

**Integrity Verification**:
```javascript
Before decryption:
  - Compute HMAC of ciphertext
  - Compare with stored MAC
  - If mismatch: data was tampered with
  - Reject decryption, log security event
```

### Data at Rest Protection

**Database Storage**:
- All user PII encrypted before storage
- Event details encrypted
- Participant lists encrypted
- Ticket information encrypted
- Only metadata stored in plaintext (IDs, timestamps)

**Protection Against**:
- Database breach: encrypted data unreadable
- Insider threats: no plaintext access
- Backup exposure: backups contain encrypted data
- SQL injection: even if data extracted, it's encrypted

---

## Access Control (RBAC)

**Implementation Location**: `server/middlewares/rbac.js`

### Role Definitions

#### Admin Role

**Permissions**:
```javascript
[
  'create:event',          // Create new events
  'read:event',            // View all events
  'update:event',          // Modify events
  'delete:event',          // Remove events
  'manage:users',          // User CRUD operations
  'view:all_attendance',   // See all attendance records
  'export:data',           // Export system data
  'manage:keys',           // Force key rotation/revocation
  'view:security_logs'     // Access audit logs
]
```

**Use Cases**:
- Event organizers
- System administrators
- Security team

#### User Role

**Permissions**:
```javascript
[
  'register:event',        // Register for events
  'view:own_tickets',      // View own tickets
  'view:events',           // Browse events
  'update:own_profile',    // Edit own profile
  'view:own_attendance'    // See own attendance
]
```

**Restrictions**:
- Cannot create events
- Cannot view other users' data
- Cannot access admin functions
- Limited to personal data

### Middleware Functions

#### Role Check

```javascript
requireRole(...roles):
  1. Extract user from request (set by isLoggedIn middleware)
  2. Check if user.role in allowed roles
  3. If yes: proceed to next middleware
  4. If no: return 403 Forbidden
```

**Usage**:
```javascript
router.post('/admin/event', 
  isLoggedIn, 
  requireRole('admin'), 
  createEvent
);
```

#### Permission Check

```javascript
requirePermission(...permissions):
  1. Extract user from request
  2. Get permissions for user's role
  3. Check if any required permission in user's permissions
  4. If yes: proceed
  5. If no: return 403 with specific permission error
```

**Usage**:
```javascript
router.get('/admin/users', 
  isLoggedIn, 
  requirePermission('manage:users'), 
  getAllUsers
);
```

---

## Session Security

**Implementation Location**: `server/middlewares/auth.js`, User model

### Session Creation

**Login Process**:
```javascript
createSession(ipAddress, userAgent):
  1. Generate random 32-character session ID
  2. Create JWT token with user payload
  3. Create session object:
     {
       sessionId: unique ID,
       token: JWT,
       ipAddress: request IP,
       userAgent: browser string,
       createdAt: current time,
       expiresAt: now + 24 hours,
       isActive: true
     }
  4. Add to user.sessions array
  5. Save user document
  6. Return session for cookie setting
```

**Token Format**:
```
JWT Token: header.payload.signature
- header: {alg: 'HS256', typ: 'JWT'}
- payload: {id: userId, email, role}
- signature: HMAC-SHA256(header.payload, secret)
```

### Session Validation

**Per-Request Validation**:
```javascript
isLoggedIn middleware:
  1. Extract token from Authorization header or cookie
  2. Parse JWT token (verify format)
  3. Decode payload to get user ID
  4. Find user in database
  5. Check if account locked
  6. Find session with matching token
  7. Verify session is active
  8. Check session not expired
  9. If all checks pass: attach user to request
  10. If any fail: return 401 Unauthorized
```

### Hijacking Prevention

**validateSessionSecurity middleware**:
```javascript
1. Get current request IP address
2. Get current request User-Agent
3. Compare with session.ipAddress
4. Compare with session.userAgent
5. If IP mismatch: revoke session, return 403
6. If User-Agent mismatch: revoke session, return 403
7. Log security event for analysis
```

**Protections**:
- Session hijacking detected if IP changes
- Browser fingerprinting via User-Agent
- Immediate session revocation on suspicious activity
- User notified of security event

### Session Management

**Multiple Sessions**:
```javascript
- User can have multiple active sessions
- Each device/browser gets unique session
- Session list shows:
  - Device/browser (from User-Agent)
  - IP address
  - Last activity time
  - Expiration time
```

**Session Revocation**:
```javascript
logout():
  1. Find session by token
  2. Set session.isActive = false
  3. Clear authentication cookie
  4. Session cannot be reused

revokeAllSessions():
  1. Set all sessions.isActive = false
  2. Force re-login from all devices
  3. Used when password changed or security incident
```

---

## API Security

### Request Authentication

**All Protected Endpoints**:
```javascript
1. Extract token from header or cookie
2. Validate JWT signature
3. Check token not expired
4. Load user from database
5. Verify user account status
6. Validate session security
7. If all pass: process request
8. If any fail: reject with appropriate error
```

### Input Validation

**User Registration**:
```javascript
- Email: valid format check
- Password: minimum length check
- Names: maximum length check
- Required fields: presence check
```

**Event Creation**:
```javascript
- Date: valid date format
- Venue: maximum length
- Description: maximum length
- Participants: maximum capacity
```

### Output Sanitization

**Password Removal**:
```javascript
- Never include password hash in responses
- Use .select('-password') in queries
- Strip sensitive fields before sending
```

**Encryption Key Protection**:
```javascript
- Never return private keys
- Only public keys exported when needed
- Keys not included in user objects
```

### Rate Limiting

**Login Endpoint**:
```javascript
- Maximum 5 attempts per IP per 15 minutes
- Account lockout after 5 failed attempts
- 30-minute lockout period
```

**API Endpoints**:
```javascript
- Recommended: 100 requests per IP per minute
- Can be configured per endpoint
- Prevents brute force and DoS
```

### CORS Configuration

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Security Headers

```javascript
Recommended headers:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000
```

### Cookie Security

```javascript
Cookie settings:
- httpOnly: true (no JavaScript access)
- secure: true in production (HTTPS only)
- sameSite: 'strict' (CSRF protection)
- maxAge: 24 hours (automatic expiration)
```

---

## Security Best Practices

### For Developers

1. **Never log sensitive data**: passwords, tokens, keys
2. **Always validate input**: sanitize user-provided data
3. **Use parameterized queries**: prevent SQL/NoSQL injection
4. **Handle errors safely**: don't expose stack traces to users
5. **Keep dependencies updated**: regular npm audit
6. **Review code changes**: security implications of changes
7. **Test security features**: unit tests for auth and encryption

### For Administrators

1. **Enable 2FA**: require for all admin accounts
2. **Monitor logs**: watch for suspicious patterns
3. **Rotate keys**: force rotation after security events
4. **Backup encrypted**: maintain encrypted backups
5. **Incident response**: documented procedure for breaches
6. **Access review**: regularly audit user permissions
7. **Patch promptly**: apply security updates quickly

### For Users

1. **Strong passwords**: minimum 12 characters, mixed case, numbers, symbols
2. **Enable 2FA**: use authenticator app, save backup codes
3. **Unique passwords**: don't reuse across sites
4. **Verify URLs**: check for HTTPS and correct domain
5. **Logout when done**: especially on shared devices
6. **Report suspicious**: notify admins of odd behavior
7. **Update apps**: keep authenticator and browsers current

---

## Compliance & Standards

### Algorithms

- **RSA**: PKCS#1 v2.2 compatible
- **ECC**: secp256k1 curve (Bitcoin standard)
- **SHA-256**: FIPS 180-4 compliant
- **HMAC**: RFC 2104 specification
- **TOTP**: RFC 6238 standard

### Data Protection

- **GDPR**: Right to erasure, data portability supported
- **PCI-DSS**: Level 1 encryption for sensitive data
- **HIPAA**: Encrypted PHI (if storing health data)
- **SOC 2**: Audit logs, access controls implemented

---

## Audit & Logging

### Security Events Logged

1. **Authentication**:
   - Successful logins
   - Failed login attempts
   - Account lockouts
   - Password changes
   - 2FA enablement/disablement

2. **Authorization**:
   - Permission denials
   - Role changes
   - Privilege escalations

3. **Data Access**:
   - Encrypted data retrieval
   - MAC verification failures
   - Decryption errors

4. **Key Management**:
   - Key generation
   - Key rotation
   - Key revocation

5. **Session Management**:
   - Session creation
   - Session hijacking attempts
   - Session revocations

### Log Format

```javascript
{
  timestamp: ISO8601,
  event: 'login_attempt',
  userId: ObjectId,
  ipAddress: String,
  userAgent: String,
  success: Boolean,
  metadata: Object
}
```

---

## Incident Response

### Security Incident Procedure

1. **Detect**: Monitor logs for anomalies
2. **Contain**: Revoke affected sessions/keys
3. **Investigate**: Review logs for scope
4. **Remediate**: Fix vulnerability
5. **Notify**: Inform affected users
6. **Document**: Record lessons learned
7. **Improve**: Update security measures

### Common Incidents

**Suspected Account Compromise**:
```javascript
1. Force logout (revoke all sessions)
2. Disable account temporarily
3. Notify user via email
4. Require password reset
5. Require 2FA enablement
6. Review access logs
```

**Key Compromise Suspected**:
```javascript
1. Revoke compromised keys
2. Generate new keys
3. Re-encrypt affected data
4. Audit recent key usage
5. Investigate compromise vector
```

**Data Breach Detected**:
```javascript
1. Assess scope (what data exposed)
2. Verify encryption (is data readable?)
3. Contain breach (close vulnerability)
4. Notify authorities if required
5. Inform affected users
6. Offer credit monitoring if needed
```

---

## Performance Considerations

### Optimization Strategies

1. **Key Caching**: Cache frequently used keys in memory (with TTL)
2. **Async Operations**: Encrypt/decrypt in background where possible
3. **Batch Processing**: Process multiple encryption operations together
4. **Lazy Loading**: Only decrypt data when actually needed
5. **Connection Pooling**: Reuse database connections
6. **Indexing**: Index userId, status fields for fast queries

### Benchmarks

**Typical Operations** (on modern server):
- RSA 2048-bit encryption: ~10ms
- RSA 2048-bit decryption: ~50ms
- ECC encryption: ~5ms
- ECC decryption: ~5ms
- SHA-256 hash: <1ms
- HMAC generation: ~1ms
- TOTP generation: ~1ms

**Recommendations**:
- Pre-generate keys during registration
- Decrypt only displayed fields
- Cache session data for duration
- Use async/await for crypto operations

---

## Testing & Validation

### Security Testing Checklist

- [ ] Password hashing works correctly
- [ ] Encryption produces different ciphertext each time
- [ ] Decryption recovers original data
- [ ] MAC verification detects tampering
- [ ] 2FA TOTP codes validate correctly
- [ ] Account lockout triggers after 5 failures
- [ ] Session hijacking prevented
- [ ] Role-based access enforced
- [ ] Key rotation works properly
- [ ] Expired keys cannot be used

### Penetration Testing

**Recommended Tests**:
1. SQL/NoSQL injection attempts
2. XSS payload injection
3. CSRF token bypass
4. Session fixation attacks
5. Brute force password attempts
6. Man-in-the-middle simulation
7. Privilege escalation attempts
8. Data tampering detection

---

## Future Enhancements

### Planned Features

1. **Biometric Authentication**: Fingerprint, face recognition
2. **Zero-Knowledge Proofs**: User verification without password
3. **Blockchain Integration**: Immutable audit trail
4. **Hardware Security Module**: Key storage in HSM
5. **Quantum-Resistant**: Post-quantum cryptography
6. **Security Analytics**: ML-based anomaly detection
7. **Distributed Keys**: Split keys across multiple servers
8. **Time-based Access**: Temporary permission grants

---

*This documentation is maintained as part of the EventShield security architecture and should be updated whenever security-related changes are made to the system.*
