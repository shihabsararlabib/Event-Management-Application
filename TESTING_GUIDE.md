# EventShield - Comprehensive Testing Guide

## CSE447 Requirements Testing Documentation

This guide provides detailed test cases for all 12 CSE447 requirements with Postman API testing and UI testing instructions.

---

## Testing Environment Setup

### Prerequisites
- ✅ MongoDB running on port 27017
- ✅ Backend server running on port 8080
- ✅ Frontend server running on port 3000
- ✅ Postman installed for API testing

### Start the Application

**Terminal 1 - Backend:**
```powershell
cd server
npm start
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm start
```

---

## Requirement 1: Login and Registration Modules

### Test Case 1.1: User Registration (API)

**Endpoint:** `POST http://localhost:8080/api/user/signup`

**Request Body:**
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "email": "john.doe@example.com"
  }
}
```

**Verification Steps:**
1. Open Postman
2. Create POST request to signup endpoint
3. Set Content-Type: application/json in Headers
4. Add request body with user details
5. Click Send
6. Verify 201 status code
7. Save the token for authenticated requests

**Screenshot Required:** `01_user_registration.png`

---

### Test Case 1.2: User Login (API)

**Endpoint:** `POST http://localhost:8080/api/user/login`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "email": "john.doe@example.com",
    "role": "user"
  }
}
```

**Verification Steps:**
1. Create POST request to login endpoint
2. Add email and password in body
3. Click Send
4. Verify JWT token is returned
5. Verify user details are correct

**Screenshot Required:** `02_user_login.png`

---

### Test Case 1.3: Login UI Test

**Steps:**
1. Open `http://localhost:3000/login`
2. Enter email: john.doe@example.com
3. Enter password: SecurePass123!
4. Click "Log In" button
5. Verify redirect to dashboard
6. Verify navbar shows user is logged in

**Screenshot Required:** `03_login_ui.png`

---

## Requirement 2: Encrypt User Information During Registration

### Test Case 2.1: Verify Encrypted Storage in Database

**Steps:**
1. Register a new user via API or UI
2. Open MongoDB Compass or mongo shell
3. Connect to: `mongodb://localhost:27017`
4. Navigate to database: `eventmanagement`
5. Open collection: `users`
6. Find the newly created user document

**Expected Result:**
```javascript
{
  "_id": ObjectId("65a1b2c3d4e5f6g7h8i9j0k1"),
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "password": "a8f5e2c3d1b4$10000$7f8e9d0c1b2a3f4e5d6c7b8a9...", // Hashed
  "encryptedData": "8x9y0z1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p...", // RSA+ECC encrypted
  "dataMac": "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t...", // MAC
  "role": "user",
  "createdAt": ISODate("2026-01-05T10:30:00Z")
}
```

**Verification:**
- ✅ Password is hashed (contains $ separators for salt$iterations$hash)
- ✅ `encryptedData` field contains encrypted user info (not plaintext)
- ✅ `dataMac` field exists for integrity verification
- ✅ firstname, lastname visible but sensitive data encrypted

**Screenshot Required:** `04_encrypted_user_mongodb.png`

---

### Test Case 2.2: Decrypt User Data on Retrieval (API)

**Endpoint:** `GET http://localhost:8080/api/user/profile`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "twoFactorEnabled": false,
    "createdAt": "2026-01-05T10:30:00.000Z"
  }
}
```

**Verification:**
- ✅ Data is automatically decrypted
- ✅ All user information is readable
- ✅ No `encryptedData` field in response (transparent decryption)

**Screenshot Required:** `05_decrypted_user_profile.png`

---

## Requirement 3: Password Hashing with Salt

### Test Case 3.1: Verify Custom SHA-256 Implementation

**Code to Review:**
Open `server/security/PasswordHasher.js` and verify:
- ✅ Custom SHA-256 implementation (no crypto library)
- ✅ Salt generation function
- ✅ PBKDF2-like iteration (10,000 rounds)
- ✅ Password verification function

**Test Password Hashing:**

**Endpoint:** `POST http://localhost:8080/api/user/test-password-hash` (if implemented)

Or test via registration:

**Request Body:**
```json
{
  "firstname": "Test",
  "lastname": "User",
  "email": "test@example.com",
  "password": "MyPassword123"
}
```

**Check Database:**
```javascript
db.users.findOne({ email: "test@example.com" })
// Expected password format:
// "a8f5e2c3d1b4$10000$7f8e9d0c1b2a3f4e5d6c7b8a9e0f1d2c3b4a5..."
//  ^^^^^^^^^^^  ^^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//     salt      iters              hash
```

**Verification:**
- ✅ Password is NOT plaintext
- ✅ Format: `salt$iterations$hash`
- ✅ Hash length is 64 characters (SHA-256 output)
- ✅ Same password produces different hashes (due to random salt)

**Screenshot Required:** `06_password_hashing.png`

---

### Test Case 3.2: Password Verification

**Test Login with Correct Password:**
```json
POST /api/user/login
{
  "email": "test@example.com",
  "password": "MyPassword123"
}
```

**Expected:** ✅ Login successful (200 OK)

**Test Login with Wrong Password:**
```json
POST /api/user/login
{
  "email": "test@example.com",
  "password": "WrongPassword"
}
```

**Expected:** ❌ Login failed (401 Unauthorized)

**Screenshot Required:** `07_password_verification.png`

---

## Requirement 4: Two-Factor Authentication (2FA)

### Test Case 4.1: Enable 2FA

**Endpoint:** `POST http://localhost:8080/api/user/2fa/enable`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "2FA setup initiated",
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCodeData": "otpauth://totp/EventShield:john.doe@example.com?secret=JBSWY3DPEHPK3PXP&issuer=EventShield",
  "backupCodes": [
    "A7B3C9D2",
    "E5F1G8H4",
    "I2J6K0L9",
    "M3N7O1P5",
    "Q8R4S0T6",
    "U1V7W3X9",
    "Y5Z2A8B4",
    "C0D6E2F8",
    "G4H0I6J2",
    "K8L4M0N6"
  ]
}
```

**Verification Steps:**
1. Send POST request to enable 2FA
2. Copy the `secret` value
3. Open Google Authenticator or Authy app
4. Add account manually with the secret
5. Or scan QR code generated from `qrCodeData`
6. Save backup codes securely

**Screenshot Required:** `08_enable_2fa.png`

---

### Test Case 4.2: Verify 2FA Code

**Endpoint:** `POST http://localhost:8080/api/user/2fa/verify`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**
```json
{
  "code": "123456"
}
```
*Use the 6-digit code from your authenticator app*

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "2FA enabled successfully"
}
```

**Verification:**
- ✅ Code from authenticator app is accepted
- ✅ User's `twoFactorEnabled` set to true in database
- ✅ Invalid codes are rejected

**Screenshot Required:** `09_verify_2fa_code.png`

---

### Test Case 4.3: Login with 2FA

**Step 1:** Login with credentials
```json
POST /api/user/login
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "2FA code required",
  "tempToken": "temp_token_here",
  "requires2FA": true
}
```

**Step 2:** Provide 2FA code
```json
POST /api/user/login/2fa
{
  "tempToken": "temp_token_here",
  "code": "123456"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "final_jwt_token_here"
}
```

**Screenshot Required:** `10_login_with_2fa.png`

---

## Requirement 5: Key Management Module

### Test Case 5.1: Automatic Key Generation

**Steps:**
1. Register a new user
2. Check MongoDB `cryptokeys` collection
3. Find keys for the new user

**Expected Result:**
```javascript
db.cryptokeys.findOne({ userId: ObjectId("65a1b2c3d4e5f6g7h8i9j0k1") })

{
  "_id": ObjectId("65a1b2c3d4e5f6g7h8i9j0k2"),
  "userId": ObjectId("65a1b2c3d4e5f6g7h8i9j0k1"),
  "rsaKeys": {
    "publicKey": {
      "e": "65537",
      "n": "25195908475657893494027183240048398571429282126204032027777137836043662020707595556264018525880784406918290641249515082189298559149176184502808489120072844992687392807287776735971418347270261896375014971824691165077613379859095700097330459748808428401797429100642458691817195118746121515172654632282216869987..."
    },
    "privateKey": {
      "d": "...",
      "n": "..."
    }
  },
  "eccKeys": {
    "publicKey": {
      "x": "...",
      "y": "..."
    },
    "privateKey": "..."
  },
  "macKey": "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p...",
  "createdAt": ISODate("2026-01-05T10:30:00Z"),
  "lastRotated": ISODate("2026-01-05T10:30:00Z"),
  "expiresAt": ISODate("2026-02-04T10:30:00Z")
}
```

**Verification:**
- ✅ RSA-2048 key pair generated
- ✅ ECC secp256k1 key pair generated
- ✅ MAC key generated
- ✅ Keys created automatically on registration
- ✅ `expiresAt` set to 30 days from creation

**Screenshot Required:** `11_key_management_mongodb.png`

---

### Test Case 5.2: Key Rotation Test

**Endpoint:** `POST http://localhost:8080/api/user/rotate-keys`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Keys rotated successfully",
  "newExpiryDate": "2026-02-04T10:30:00.000Z"
}
```

**Verification:**
1. Check `cryptokeys` collection before rotation
2. Call rotate-keys endpoint
3. Check `cryptokeys` collection after rotation
4. Verify new keys generated
5. Verify `lastRotated` updated
6. Verify `expiresAt` extended by 30 days

**Screenshot Required:** `12_key_rotation.png`

---

## Requirement 6: Create, View, Edit Posts/Profiles

### Test Case 6.1: Create Event (Post)

**Endpoint:** `POST http://localhost:8080/api/event/create`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "data": "{\"eventName\":\"Tech Conference 2026\",\"description\":\"Annual technology conference\",\"date\":\"2026-03-15T09:00:00Z\",\"venue\":\"BRAC University\",\"speakers\":[\"Dr. Smith\",\"Prof. Johnson\"],\"maxParticipants\":500}"
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Event created successfully with encryption!",
  "event": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k3",
    "eventName": "Tech Conference 2026",
    "date": "2026-03-15T09:00:00.000Z"
  }
}
```

**Verification:**
- ✅ Event created successfully
- ✅ Check MongoDB: event data is encrypted
- ✅ `encryptedData` and `dataMac` fields present

**Screenshot Required:** `13_create_event.png`

---

### Test Case 6.2: View All Events

**Endpoint:** `GET http://localhost:8080/api/event`

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "data": [
    {
      "id": "65a1b2c3d4e5f6g7h8i9j0k3",
      "eventName": "Tech Conference 2026",
      "description": "Annual technology conference",
      "date": "2026-03-15T09:00:00.000Z",
      "venue": "BRAC University",
      "speakers": ["Dr. Smith", "Prof. Johnson"],
      "maxParticipants": 500,
      "currentParticipants": 0
    }
  ]
}
```

**Verification:**
- ✅ All events returned
- ✅ Data automatically decrypted
- ✅ Public endpoint (no auth required)

**Screenshot Required:** `14_view_all_events.png`

---

### Test Case 6.3: View/Edit User Profile

**Get Profile:**
```
GET http://localhost:8080/api/user/profile
Authorization: Bearer <your_jwt_token>
```

**Update Profile:**
```
PUT http://localhost:8080/api/user/profile
Authorization: Bearer <your_jwt_token>

{
  "firstname": "John",
  "lastname": "Doe",
  "phone": "+880123456789"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "firstname": "John",
    "lastname": "Doe",
    "email": "john.doe@example.com",
    "phone": "+880123456789"
  }
}
```

**Verification:**
- ✅ Profile data retrieved
- ✅ Profile updated successfully
- ✅ Check MongoDB: updated data is re-encrypted

**Screenshot Required:** `15_profile_update.png`

---

## Requirement 7: Encrypted Data Storage

### Test Case 7.1: Verify All Data Encrypted in MongoDB

**Steps:**
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017/eventmanagement`
3. Check these collections:

**Users Collection:**
```javascript
db.users.findOne()
// Should have: encryptedData, dataMac, hashed password
```

**Events Collection:**
```javascript
db.events.findOne()
// Should have: encryptedData, dataMac
```

**Verification:**
- ✅ No plaintext sensitive data visible
- ✅ All collections use encryption
- ✅ MAC fields present for integrity
- ✅ Even if database is compromised, data is protected

**Screenshot Required:** `16_encrypted_data_mongodb.png`

---

## Requirement 8: Message Authentication Codes (MAC)

### Test Case 8.1: MAC Generation and Verification

**Test MAC Integrity:**

**Endpoint:** `GET http://localhost:8080/api/user/profile`

**Behind the scenes:**
1. Data retrieved from database with `encryptedData` and `dataMac`
2. System verifies MAC before decryption
3. If MAC invalid, request fails with integrity error

**Test Tampered Data:**
1. Manually edit `dataMac` in MongoDB
2. Try to retrieve user profile
3. Should receive error: "Data integrity check failed"

**Verification:**
- ✅ HMAC-SHA256 used for MAC generation
- ✅ MAC verified before every decryption
- ✅ Tampered data detected and rejected

**Screenshot Required:** `17_mac_verification.png`

---

### Test Case 8.2: Review MAC Implementation

**Code Review:**
Open `server/security/MACGenerator.js`

**Verify:**
- ✅ Custom HMAC-SHA256 implementation
- ✅ Custom CBC-MAC implementation
- ✅ No built-in crypto.createHmac() used
- ✅ generateHMAC() function
- ✅ verifyHMAC() function

**Screenshot Required:** `18_mac_code.png`

---

## Requirement 9: Asymmetric Encryption Only (RSA & ECC)

### Test Case 9.1: Verify RSA Implementation

**Code Review:**
Open `server/security/RSAEncryption.js`

**Verify:**
- ✅ Custom RSA-2048 implementation
- ✅ Miller-Rabin primality test
- ✅ Key generation (p, q, n, e, d)
- ✅ Encryption function
- ✅ Decryption function
- ✅ No built-in crypto used

**Test RSA Encryption:**
```javascript
// In Postman or code
const rsa = new RSAEncryption();
rsa.generateKeyPair(2048);
const encrypted = rsa.encrypt("Hello World");
const decrypted = rsa.decrypt(encrypted);
console.log(decrypted === "Hello World"); // true
```

**Screenshot Required:** `19_rsa_implementation.png`

---

### Test Case 9.2: Verify ECC Implementation

**Code Review:**
Open `server/security/ECCEncryption.js`

**Verify:**
- ✅ Custom ECC secp256k1 implementation
- ✅ Point addition on elliptic curve
- ✅ Scalar multiplication
- ✅ Key generation
- ✅ Encryption/decryption functions
- ✅ No built-in crypto used

**Screenshot Required:** `20_ecc_implementation.png`

---

### Test Case 9.3: Confirm No Symmetric Encryption

**Search Codebase:**
```powershell
cd server
grep -r "AES" .
grep -r "DES" .
grep -r "createCipher" .
```

**Expected Result:** No matches found

**Verification:**
- ✅ No AES encryption used
- ✅ No DES encryption used
- ✅ No symmetric algorithms anywhere
- ✅ Only RSA and ECC used

**Screenshot Required:** `21_no_symmetric_crypto.png`

---

## Requirement 10: Multi-Level Encryption (Optional)

### Test Case 10.1: Verify Dual Encryption

**Code Review:**
Open `server/middlewares/encryptionService.js`

**Verify encryptData function:**
```javascript
export const encryptData = async (data, keys) => {
    // Layer 1: RSA encryption
    const rsa = new RSAEncryption();
    const rsaEncrypted = rsa.encryptLong(dataStr);
    
    // Layer 2: ECC encryption
    const ecc = new ECCEncryption();
    const eccEncrypted = ecc.encryptLong(rsaEncrypted);
    
    // MAC generation
    const mac = new MACGenerator();
    const dataMac = mac.generateHMAC(eccEncrypted, keys.macKey);
    
    return { encryptedData: eccEncrypted, dataMac: dataMac };
};
```

**Verification:**
- ✅ Data encrypted with RSA first
- ✅ RSA output encrypted with ECC
- ✅ MAC generated on final encrypted data
- ✅ Two layers of asymmetric encryption

**Screenshot Required:** `22_multi_level_encryption.png`

---

### Test Case 10.2: Test Decryption Layers

**Verify decryptData function:**
```javascript
export const decryptData = async (encryptedData, dataMac, keys) => {
    // Verify MAC
    const mac = new MACGenerator();
    const isValid = mac.verifyHMAC(encryptedData, dataMac, keys.macKey);
    
    // Layer 1: ECC decryption
    const ecc = new ECCEncryption();
    const eccDecrypted = ecc.decryptLong(encryptedData);
    
    // Layer 2: RSA decryption
    const rsa = new RSAEncryption();
    const rsaDecrypted = rsa.decryptLong(eccDecrypted);
    
    return rsaDecrypted;
};
```

**Screenshot Required:** `23_multi_level_decryption.png`

---

## Requirement 11: Role-Based Access Control (RBAC)

### Test Case 11.1: User Role Permissions

**Register as Regular User:**
```json
POST /api/user/signup
{
  "firstname": "Regular",
  "lastname": "User",
  "email": "user@example.com",
  "password": "Password123"
}
```

**Try to Access Admin Endpoint:**
```
GET http://localhost:8080/api/user/all
Authorization: Bearer <user_jwt_token>
```

**Expected Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

**Verification:**
- ✅ Regular users cannot access admin endpoints
- ✅ 403 Forbidden returned

**Screenshot Required:** `24_user_role_denied.png`

---

### Test Case 11.2: Organizer Role Permissions

**Create Event as Organizer:**
```json
POST /api/event/create
Authorization: Bearer <organizer_token>
{
  "data": "{\"eventName\":\"My Event\",...}"
}
```

**Expected:** ✅ Event created successfully

**Try to View Participants (Your Event):**
```
GET /api/event/:eventId/participants
Authorization: Bearer <organizer_token>
```

**Expected:** ✅ Participant list returned

**Try to View Participants (Someone Else's Event):**
```
GET /api/event/:otherEventId/participants
Authorization: Bearer <organizer_token>
```

**Expected:** ❌ 403 Forbidden

**Screenshot Required:** `25_organizer_role.png`

---

### Test Case 11.3: Admin Role Permissions

**Login as Admin:**
```json
POST /api/user/login
{
  "email": "admin@eventshield.com",
  "password": "AdminPass123"
}
```

**Get All Users (Admin Only):**
```
GET http://localhost:8080/api/user/all
Authorization: Bearer <admin_jwt_token>
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "users": [
    { "id": "...", "email": "user1@example.com", "role": "user" },
    { "id": "...", "email": "organizer@example.com", "role": "organizer" },
    { "id": "...", "email": "admin@eventshield.com", "role": "admin" }
  ]
}
```

**Verification:**
- ✅ Admin can access all user data
- ✅ Admin can manage all events
- ✅ Admin can view all participants

**Screenshot Required:** `26_admin_role.png`

---

## Requirement 12: Secure Session Management

### Test Case 12.1: JWT Token Generation

**Login and Capture Token:**
```json
POST /api/user/login
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Decode JWT Token:**
Go to https://jwt.io and paste the token

**Expected Payload:**
```json
{
  "id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "email": "john.doe@example.com",
  "role": "user",
  "iat": 1704448200,
  "exp": 1704534600
}
```

**Verification:**
- ✅ Token contains user ID and role
- ✅ Token has expiry time (24 hours)
- ✅ Token is signed (cannot be tampered)

**Screenshot Required:** `27_jwt_token.png`

---

### Test Case 12.2: Session Validation

**Access Protected Endpoint:**
```
GET http://localhost:8080/api/user/profile
Authorization: Bearer <valid_token>
```

**Expected:** ✅ 200 OK with user data

**Try with Invalid Token:**
```
GET http://localhost:8080/api/user/profile
Authorization: Bearer invalid_token_here
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**Screenshot Required:** `28_session_validation.png`

---

### Test Case 12.3: Session Hijacking Prevention

**Test 1: Token Expiry**
1. Login and get token
2. Wait 24+ hours (or change system time)
3. Try to access protected endpoint
4. Expected: 401 Unauthorized (token expired)

**Test 2: Token from Different IP**
1. Login from one device/IP
2. Copy token to another device/IP
3. Try to access protected endpoint
4. Expected: Session security check may flag (if implemented)

**Test 3: Logout Invalidation**
```
POST /api/user/logout
Authorization: Bearer <token>
```

**Then try to use same token:**
```
GET /api/user/profile
Authorization: Bearer <old_token>
```

**Expected:** 401 Unauthorized

**Screenshot Required:** `29_session_security.png`

---

## Frontend UI Testing

### Test Case UI-1: Registration Page

**Steps:**
1. Navigate to `http://localhost:3000/signup`
2. Fill in all fields
3. Click Sign Up
4. Verify success message
5. Verify redirect to login

**Screenshot Required:** `30_signup_ui.png`

---

### Test Case UI-2: Login Page

**Steps:**
1. Navigate to `http://localhost:3000/login`
2. Enter credentials
3. Click Log In
4. Verify redirect to dashboard

**Screenshot Required:** `31_login_ui.png`

---

### Test Case UI-3: Events Dashboard

**Steps:**
1. Login first
2. Navigate to `http://localhost:3000/dashboard`
3. View event cards
4. Test search functionality
5. Click on event for details

**Screenshot Required:** `32_dashboard_ui.png`

---

### Test Case UI-4: Create Event Form

**Steps:**
1. Login as organizer
2. Click "Create New Event"
3. Fill in Basic Details tab
4. Switch to About Event tab
5. Submit form
6. Verify event created

**Screenshot Required:** `33_create_event_ui.png`

---

### Test Case UI-5: Event Registration

**Steps:**
1. Login as user
2. Browse events
3. Click on event
4. Click "Register" button
5. Verify ticket generated
6. View "My Events"

**Screenshot Required:** `34_register_event_ui.png`

---

## Performance Testing

### Test Case PERF-1: Lighthouse Report

**Steps:**
1. Open `http://localhost:3000` in Chrome
2. Press F12 (DevTools)
3. Click "Lighthouse" tab
4. Select "Performance", "Accessibility", "Best Practices", "SEO"
5. Click "Analyze page load"
6. Wait for report

**Expected Scores:**
- Performance: 85+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

**Screenshot Required:** `35_lighthouse_report.png`

---

### Test Case PERF-2: Network Analysis

**Steps:**
1. Open DevTools → Network tab
2. Reload page
3. Check total resources loaded
4. Check total size
5. Check load time

**Expected:**
- Total resources: < 50
- Total size: < 3 MB
- Load time: < 3 seconds

**Screenshot Required:** `36_network_analysis.png`

---

### Test Case PERF-3: Mobile Responsiveness

**Steps:**
1. Open DevTools (F12)
2. Click device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro"
4. Navigate through pages
5. Test all interactions

**Verify:**
- ✅ All pages responsive
- ✅ Buttons clickable (44px minimum)
- ✅ Text readable
- ✅ No horizontal scroll

**Screenshot Required:** `37_mobile_responsive.png`

---

## Security Testing

### Test Case SEC-1: SQL Injection Prevention

**Test:**
```json
POST /api/user/login
{
  "email": "' OR '1'='1",
  "password": "' OR '1'='1"
}
```

**Expected:** ❌ Login failed (not vulnerable)

---

### Test Case SEC-2: XSS Prevention

**Test:**
```json
POST /api/event/create
{
  "data": "{\"eventName\":\"<script>alert('XSS')</script>\",...}"
}
```

**Expected:** Script tags sanitized or escaped

---

### Test Case SEC-3: CSRF Protection

**Verify:**
- ✅ All POST/PUT/DELETE require authentication
- ✅ JWT token required in headers
- ✅ No cookies used (JWT in Authorization header)

---

## Complete Test Checklist

### API Testing (Postman) - 29 Screenshots
- [ ] 01 - User Registration
- [ ] 02 - User Login
- [ ] 03 - Login UI
- [ ] 04 - Encrypted User MongoDB
- [ ] 05 - Decrypted User Profile
- [ ] 06 - Password Hashing
- [ ] 07 - Password Verification
- [ ] 08 - Enable 2FA
- [ ] 09 - Verify 2FA Code
- [ ] 10 - Login with 2FA
- [ ] 11 - Key Management MongoDB
- [ ] 12 - Key Rotation
- [ ] 13 - Create Event
- [ ] 14 - View All Events
- [ ] 15 - Profile Update
- [ ] 16 - Encrypted Data MongoDB
- [ ] 17 - MAC Verification
- [ ] 18 - MAC Code
- [ ] 19 - RSA Implementation
- [ ] 20 - ECC Implementation
- [ ] 21 - No Symmetric Crypto
- [ ] 22 - Multi-Level Encryption
- [ ] 23 - Multi-Level Decryption
- [ ] 24 - User Role Denied
- [ ] 25 - Organizer Role
- [ ] 26 - Admin Role
- [ ] 27 - JWT Token
- [ ] 28 - Session Validation
- [ ] 29 - Session Security

### UI Testing - 5 Screenshots
- [ ] 30 - Signup UI
- [ ] 31 - Login UI
- [ ] 32 - Dashboard UI
- [ ] 33 - Create Event UI
- [ ] 34 - Register Event UI

### Performance Testing - 3 Screenshots
- [ ] 35 - Lighthouse Report
- [ ] 36 - Network Analysis
- [ ] 37 - Mobile Responsive

---

## Postman Collection Export

**To export all test cases:**
1. Open Postman
2. Click Collections
3. Right-click "EventShield Tests"
4. Export Collection
5. Save as `EventShield_Tests.postman_collection.json`
6. Include in project submission

---

## Test Report Summary

After completing all tests, create a summary:

**Total Tests:** 37  
**Passed:** __ / 37  
**Failed:** __ / 37  

**Requirements Coverage:**
- ✅ Requirement 1: Login & Registration
- ✅ Requirement 2: Encrypt User Information
- ✅ Requirement 3: Password Hashing
- ✅ Requirement 4: Two-Factor Authentication
- ✅ Requirement 5: Key Management
- ✅ Requirement 6: CRUD Operations
- ✅ Requirement 7: Encrypted Storage
- ✅ Requirement 8: MAC Verification
- ✅ Requirement 9: Asymmetric Encryption
- ✅ Requirement 10: Multi-Level Encryption
- ✅ Requirement 11: RBAC
- ✅ Requirement 12: Session Management

---

## Conclusion

This comprehensive testing guide covers all 12 CSE447 requirements with detailed test cases, expected results, and screenshot requirements. Follow each test case systematically and document results with screenshots for your project report.

**Total Screenshots Required:** 37  
**Estimated Testing Time:** 4-6 hours  

Good luck with your testing! 🚀
