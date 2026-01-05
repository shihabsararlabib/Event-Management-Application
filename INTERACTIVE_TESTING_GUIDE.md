# 🧪 EventShield - Interactive Testing Guide

**Date:** January 5, 2026  
**Tester:** Follow each test step-by-step to verify all requirements

## 🚀 Prerequisites

✅ **Backend Running:** http://localhost:8080  
✅ **Frontend Running:** http://localhost:3000  
✅ **MongoDB Running:** mongodb://localhost:27017

---

## 📋 Test Checklist

Use this checklist to track your progress:

- [ ] Requirement 1: Login & Registration
- [ ] Requirement 2: Encrypted User Info
- [ ] Requirement 3: Password Hashing & Salting
- [ ] Requirement 4: Two-Factor Authentication
- [ ] Requirement 5: Key Management
- [ ] Requirement 6: Encrypted CRUD Operations
- [ ] Requirement 7: All Data Encrypted at Rest
- [ ] Requirement 8: MAC for Data Integrity
- [ ] Requirement 9: Asymmetric Encryption Only
- [ ] Requirement 10: Multi-Level Encryption
- [ ] Requirement 11: Role-Based Access Control
- [ ] Requirement 12: Secure Session Management

---

## 🔐 Test 1: Login & Registration Module

### Step 1.1: Test Registration

1. **Open Browser:** Navigate to `http://localhost:3000/signup`

2. **Fill Registration Form:**
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john.doe@test.com`
   - Password: `SecurePass123!`

3. **Click "Sign Up"**

4. **Expected Result:**
   - ✅ Registration successful
   - ✅ Redirected to dashboard
   - ✅ JWT token stored in localStorage
   - ✅ User info displayed in navbar

5. **Verify in Browser Console:**
   ```javascript
   // Press F12, go to Console tab
   localStorage.getItem('user')
   // Should show user data
   ```

### Step 1.2: Test Login

1. **Logout:** Click your avatar → Logout

2. **Navigate to:** `http://localhost:3000/login`

3. **Enter Credentials:**
   - Email: `john.doe@test.com`
   - Password: `SecurePass123!`

4. **Click "Login"**

5. **Expected Result:**
   - ✅ Login successful
   - ✅ Redirected to dashboard
   - ✅ Session created

### Step 1.3: Test Invalid Login

1. **Navigate to:** `http://localhost:3000/login`

2. **Enter Wrong Password:**
   - Email: `john.doe@test.com`
   - Password: `WrongPassword123!`

3. **Click "Login"**

4. **Expected Result:**
   - ❌ Login failed
   - ❌ Error message: "Invalid credentials"
   - ❌ No session created

**✅ Requirement 1: PASS / FAIL**

---

## 🔒 Test 2: Encrypted User Information Storage

### Step 2.1: Check Database Encryption

1. **Open MongoDB Shell:**
   ```powershell
   mongosh
   ```

2. **Switch to EventShield Database:**
   ```javascript
   use eventshield
   ```

3. **Find Your User:**
   ```javascript
   db.users.findOne({email: "john.doe@test.com"})
   ```

4. **Expected Result - Check These Fields:**
   ```javascript
   {
     _id: ObjectId("..."),
     firstname: "John",  // Plain for queries
     lastname: "Doe",     // Plain for queries
     email: "john.doe@test.com",  // Plain for login
     
     // ENCRYPTED DATA - Should see Base64 strings
     encryptedData: {
       firstname: "U2FsdGVkX1...",  // ✅ Encrypted
       lastname: "U2FsdGVkX1...",   // ✅ Encrypted
       email: "U2FsdGVkX1...",      // ✅ Encrypted
     },
     
     // KEYS - Should exist
     rsaPublicKey: "-----BEGIN PUBLIC KEY-----...",
     rsaPrivateKey: "encrypted_base64_string",
     eccPublicKey: "04...",
     eccPrivateKey: "encrypted_base64_string",
     macKey: "encrypted_base64_string",
     
     // INTEGRITY - Should exist
     dataMac: "a1b2c3d4e5f6...",  // ✅ HMAC signature
   }
   ```

5. **Verify Encryption:**
   - ✅ `encryptedData` field exists
   - ✅ Values are Base64 strings (unreadable)
   - ✅ NOT plaintext "John" or "Doe"
   - ✅ RSA keys exist
   - ✅ ECC keys exist
   - ✅ MAC key exists
   - ✅ dataMac exists

6. **Try to Read Encrypted Data:**
   ```javascript
   db.users.findOne({email: "john.doe@test.com"}).encryptedData.firstname
   ```
   - **Expected:** Gibberish Base64 string (unreadable without decryption)

**✅ Requirement 2: PASS / FAIL**

---

## 🔑 Test 3: Password Hashing & Salting

### Step 3.1: Check Password Hash in Database

1. **In MongoDB Shell:**
   ```javascript
   db.users.findOne({email: "john.doe@test.com"}, {password: 1, passwordSalt: 1, passwordIterations: 1})
   ```

2. **Expected Result:**
   ```javascript
   {
     password: "a1b2c3d4e5f6789...very_long_hash_string",  // ✅ Hashed
     passwordSalt: "random_32_byte_hex_string",            // ✅ Unique salt
     passwordIterations: 100000                            // ✅ 100K iterations
   }
   ```

3. **Verification Checklist:**
   - ✅ Password is NOT "SecurePass123!" (plaintext)
   - ✅ Password is a long hash string
   - ✅ `passwordSalt` field exists with random value
   - ✅ `passwordIterations` equals 100000

### Step 3.2: Verify Custom Implementation (No bcrypt)

1. **Open PowerShell in Project Root:**
   ```powershell
   cd c:\Users\AABATT\Event-Management-Application
   ```

2. **Search for bcrypt Usage in User Model:**
   ```powershell
   Select-String -Path "server\models\User.js" -Pattern "bcrypt"
   ```

3. **Expected Result:**
   - ✅ **NO MATCHES FOUND** (no bcrypt used)

4. **Check Custom PasswordHasher:**
   ```powershell
   Get-Content server\security\PasswordHasher.js | Select-String -Pattern "class PasswordHasher"
   ```

5. **Expected Result:**
   - ✅ `class PasswordHasher` found (custom implementation)

### Step 3.3: Test Password Verification

1. **Login with Correct Password:**
   - Email: `john.doe@test.com`
   - Password: `SecurePass123!`
   - **Expected:** ✅ Login successful

2. **Login with Wrong Password:**
   - Email: `john.doe@test.com`
   - Password: `SecurePass123` (missing !)
   - **Expected:** ❌ Login failed

**✅ Requirement 3: PASS / FAIL**

---

## 📱 Test 4: Two-Factor Authentication (2FA)

### Step 4.1: Enable 2FA

1. **Login to EventShield:**
   - Navigate to `http://localhost:3000/login`
   - Login with your credentials

2. **Test 2FA Setup API (Using PowerShell):**
   ```powershell
   # Get your JWT token from browser localStorage
   # Press F12 → Application → Local Storage → token
   
   $token = "YOUR_JWT_TOKEN_HERE"
   
   # Call setup-2fa endpoint
   $response = Invoke-RestMethod -Uri "http://localhost:8080/api/user/setup-2fa" -Method POST -Headers @{Authorization="Bearer $token"} -ContentType "application/json"
   
   # View secret and QR code
   $response
   ```

3. **Expected Response:**
   ```json
   {
     "success": true,
     "secret": "JBSWY3DPEHPK3PXP",
     "qrCode": "data:image/png;base64,iVBORw0KG...",
     "message": "Scan this QR code with Google Authenticator"
   }
   ```

4. **Setup Authenticator App:**
   - **Option A:** Scan QR code with Google Authenticator app
   - **Option B:** Manually enter secret in authenticator app

5. **Get 6-Digit Code:**
   - Open Google Authenticator
   - Note the 6-digit code (e.g., `123456`)

### Step 4.2: Verify 2FA

1. **Verify 2FA (Using PowerShell):**
   ```powershell
   $verifyBody = @{
     token = "123456"  # Replace with actual 6-digit code from app
   } | ConvertTo-Json
   
   Invoke-RestMethod -Uri "http://localhost:8080/api/user/verify-2fa" -Method POST -Headers @{Authorization="Bearer $token"} -ContentType "application/json" -Body $verifyBody
   ```

2. **Expected Response:**
   ```json
   {
     "success": true,
     "message": "2FA enabled successfully"
   }
   ```

3. **Verify in Database:**
   ```javascript
   db.users.findOne({email: "john.doe@test.com"}, {twoFactorEnabled: 1, twoFactorSecret: 1})
   ```
   
4. **Expected Result:**
   ```javascript
   {
     twoFactorEnabled: true,
     twoFactorSecret: "encrypted_base64_string"  // ✅ Encrypted
   }
   ```

### Step 4.3: Test 2FA Login

1. **Logout from EventShield**

2. **Try Login WITHOUT 2FA Token:**
   ```powershell
   $loginBody = @{
     email = "john.doe@test.com"
     password = "SecurePass123!"
   } | ConvertTo-Json
   
   Invoke-RestMethod -Uri "http://localhost:8080/api/user/login" -Method POST -ContentType "application/json" -Body $loginBody
   ```

3. **Expected Response:**
   - ❌ Login rejected
   - ❌ "2FA token required"

4. **Try Login WITH 2FA Token:**
   ```powershell
   $loginBody = @{
     email = "john.doe@test.com"
     password = "SecurePass123!"
     twoFactorToken = "123456"  # Current 6-digit code from app
   } | ConvertTo-Json
   
   Invoke-RestMethod -Uri "http://localhost:8080/api/user/login" -Method POST -ContentType "application/json" -Body $loginBody
   ```

5. **Expected Response:**
   - ✅ Login successful
   - ✅ JWT token returned

### Step 4.4: Verify Custom TOTP Implementation

1. **Check TwoFactorAuth.js:**
   ```powershell
   Get-Content server\security\TwoFactorAuth.js | Select-Object -First 50
   ```

2. **Expected Result:**
   - ✅ `class TwoFactorAuth` found
   - ✅ `generateTOTP()` method exists
   - ✅ `verifyTOTP()` method exists
   - ✅ NO `speakeasy` or other 2FA library imported

**✅ Requirement 4: PASS / FAIL**

---

## 🔐 Test 5: Key Management Module

### Step 5.1: Verify Keys Generated on Registration

1. **Check Database for Keys:**
   ```javascript
   db.users.findOne({email: "john.doe@test.com"}, {
     rsaPublicKey: 1,
     rsaPrivateKey: 1,
     eccPublicKey: 1,
     eccPrivateKey: 1,
     macKey: 1
   })
   ```

2. **Expected Result:**
   ```javascript
   {
     rsaPublicKey: "-----BEGIN PUBLIC KEY-----\nMIIBIjANB...\n-----END PUBLIC KEY-----",
     rsaPrivateKey: "U2FsdGVkX1...",  // ✅ Encrypted
     eccPublicKey: "04a1b2c3d4e5...",
     eccPrivateKey: "U2FsdGVkX1...",  // ✅ Encrypted
     macKey: "U2FsdGVkX1..."           // ✅ Encrypted
   }
   ```

3. **Verification Checklist:**
   - ✅ RSA public key exists (plaintext - needed for encryption)
   - ✅ RSA private key exists (encrypted)
   - ✅ ECC public key exists (plaintext)
   - ✅ ECC private key exists (encrypted)
   - ✅ MAC key exists (encrypted)

### Step 5.2: Verify KeyManager Module

1. **Check KeyManager.js:**
   ```powershell
   Get-Content server\security\KeyManager.js | Select-String -Pattern "class KeyManager"
   ```

2. **Expected Result:**
   - ✅ `class KeyManager` found

3. **Check Key Management Methods:**
   ```powershell
   Get-Content server\security\KeyManager.js | Select-String -Pattern "generateUserKeys|storeKeys|getUserKeys|rotateKeys"
   ```

4. **Expected Result:**
   - ✅ `generateUserKeys()` - Key generation
   - ✅ `storeKeys()` - Secure storage
   - ✅ `getUserKeys()` - Key retrieval
   - ✅ `rotateKeys()` - Key rotation

### Step 5.3: Test Key Usage in Encryption

1. **Create a New Event:**
   - Navigate to `http://localhost:3000/add-event`
   - Fill in event details
   - Submit event

2. **Check Event Encryption:**
   ```javascript
   db.events.findOne({}, {encryptedData: 1, dataMac: 1})
   ```

3. **Expected Result:**
   - ✅ Event data encrypted using your RSA key
   - ✅ MAC generated using your MAC key

**✅ Requirement 5: PASS / FAIL**

---

## 📝 Test 6: Encrypted CRUD Operations

### Step 6.1: Create Event (Encrypted)

1. **Navigate to:** `http://localhost:3000/add-event`

2. **Fill Event Form:**
   - Event Name: `Cybersecurity Workshop 2026`
   - Description: `Learn about encryption and security best practices`
   - Date: Select future date
   - Time: `10:00 AM`
   - Venue: `Tech Hub, Dhaka`
   - Max Participants: `50`
   - Upload Event Image

3. **Click "Create Event"**

4. **Expected Result:**
   - ✅ Event created successfully
   - ✅ Redirected to event details page

### Step 6.2: Verify Data Encrypted in Database

1. **Check Database:**
   ```javascript
   db.events.findOne({}, {encryptedData: 1, dataMac: 1})
   ```

2. **Expected Result:**
   ```javascript
   {
     encryptedData: {
       eventName: "U2FsdGVkX1...",      // ✅ Encrypted
       description: "U2FsdGVkX1...",    // ✅ Encrypted
       venue: "U2FsdGVkX1...",          // ✅ Encrypted
       speakers: "U2FsdGVkX1...",       // ✅ Encrypted
       highlights: "U2FsdGVkX1...",     // ✅ Encrypted
     },
     dataMac: "a1b2c3d4e5f6...",        // ✅ MAC signature
   }
   ```

3. **Try to Read Encrypted Data:**
   ```javascript
   db.events.findOne({}).encryptedData.eventName
   ```
   - **Expected:** Unreadable Base64 string (NOT "Cybersecurity Workshop 2026")

### Step 6.3: Read Event (Decrypted)

1. **Navigate to Dashboard:** `http://localhost:3000/dashboard`

2. **Click on Your Event**

3. **Expected Result:**
   - ✅ Event name: "Cybersecurity Workshop 2026" (decrypted)
   - ✅ Description: "Learn about encryption..." (decrypted)
   - ✅ All details readable (automatically decrypted)

### Step 6.4: Update Event (Re-encrypted)

1. **In Event Details Page:**
   - Click "Edit Event" button

2. **Change Description to:**
   - `Advanced cybersecurity techniques and hands-on labs`

3. **Click "Update Event"**

4. **Check Database:**
   ```javascript
   db.events.findOne({}).encryptedData.description
   ```

5. **Expected Result:**
   - ✅ New encrypted value (different from before)
   - ✅ Still unreadable Base64 string

6. **Check Event Page:**
   - ✅ Shows new description (decrypted correctly)

### Step 6.5: Delete Event (Secure Deletion)

1. **Navigate to:** `http://localhost:3000/my-events`

2. **Click "Delete" on Your Event**

3. **Confirm Deletion**

4. **Expected Result:**
   - ✅ Event removed from database
   - ✅ Encrypted keys and data wiped

**✅ Requirement 6: PASS / FAIL**

---

## 🗄️ Test 7: All Data Encrypted at Rest

### Step 7.1: Complete Database Audit

1. **Open MongoDB Shell:**
   ```javascript
   use eventshield
   ```

2. **Check Users Collection:**
   ```javascript
   db.users.findOne()
   ```
   - ✅ `encryptedData` field: All user info encrypted
   - ✅ `password`: Hashed (not plaintext)
   - ✅ `rsaPrivateKey`: Encrypted
   - ✅ `eccPrivateKey`: Encrypted
   - ✅ `macKey`: Encrypted
   - ✅ `twoFactorSecret`: Encrypted

3. **Check Events Collection:**
   ```javascript
   db.events.findOne()
   ```
   - ✅ `encryptedData` field: All event info encrypted
   - ✅ No plaintext event names, descriptions, venues

4. **Check Participants Array:**
   ```javascript
   db.events.findOne({}, {participants: 1})
   ```
   - ✅ `encryptedTicketData`: Ticket info encrypted

### Step 7.2: Verify No Plaintext Sensitive Data

1. **Search for Plaintext Email:**
   ```javascript
   db.users.find({email: "john.doe@test.com"})
   ```
   - ⚠️ Email is plaintext (needed for login lookup)
   - ✅ BUT also encrypted in `encryptedData.email`

2. **Search for Plaintext Event Data:**
   ```javascript
   db.events.find({}, {eventName: 1, description: 1, venue: 1})
   ```
   - ✅ No plaintext event details outside `encryptedData`

3. **Verify Sensitive Data Protection:**
   - ✅ Phone numbers: Encrypted
   - ✅ Addresses: Encrypted
   - ✅ Payment info: Encrypted
   - ✅ Private keys: Encrypted
   - ✅ 2FA secrets: Encrypted

**Encryption Coverage: ____%**

**✅ Requirement 7: PASS / FAIL**

---

## ✅ Test 8: MAC (Message Authentication Code)

### Step 8.1: Verify HMAC Implementation

1. **Check MACGenerator.js:**
   ```powershell
   Get-Content server\security\MACGenerator.js | Select-String -Pattern "class MACGenerator"
   ```

2. **Expected Result:**
   - ✅ `class MACGenerator` found

3. **Check MAC Methods:**
   ```powershell
   Get-Content server\security\MACGenerator.js | Select-String -Pattern "generateHMAC|generateCBCMAC|verifyHMAC|verifyCBCMAC"
   ```

4. **Expected Result:**
   - ✅ `generateHMAC()` - HMAC generation
   - ✅ `generateCBCMAC()` - CBC-MAC generation
   - ✅ `verifyHMAC()` - HMAC verification
   - ✅ `verifyCBCMAC()` - CBC-MAC verification

### Step 8.2: Verify MAC in Database

1. **Check User Data MAC:**
   ```javascript
   db.users.findOne({email: "john.doe@test.com"}, {dataMac: 1})
   ```

2. **Expected Result:**
   ```javascript
   {
     dataMac: "a1b2c3d4e5f6789abcdef..."  // ✅ HMAC signature (hex string)
   }
   ```

3. **Check Event Data MAC:**
   ```javascript
   db.events.findOne({}, {dataMac: 1})
   ```

4. **Expected Result:**
   ```javascript
   {
     dataMac: "fedcba987654321..."  // ✅ CBC-MAC signature
   }
   ```

### Step 8.3: Test MAC Integrity Verification

1. **Get Current Event Data:**
   ```javascript
   var event = db.events.findOne()
   var originalMac = event.dataMac
   var originalData = event.encryptedData
   ```

2. **Tamper with Data:**
   ```javascript
   db.events.updateOne(
     {_id: event._id},
     {$set: {"encryptedData.eventName": "TAMPERED_DATA_ABC123"}}
   )
   ```

3. **Try to View Event:**
   - Navigate to event details page
   - **Expected Result:** ❌ Error: "Data integrity check failed"

4. **Check Console/Network:**
   - Open DevTools (F12)
   - Check Network tab
   - **Expected:** 400 or 500 error with integrity message

5. **Restore Data:**
   ```javascript
   db.events.updateOne(
     {_id: event._id},
     {$set: {encryptedData: originalData}}
   )
   ```

6. **View Event Again:**
   - **Expected Result:** ✅ Works correctly (integrity verified)

**✅ Requirement 8: PASS / FAIL**

---

## 🔐 Test 9: Asymmetric Encryption Only (RSA & ECC)

### Step 9.1: Verify RSA Implementation

1. **Check RSAEncryption.js:**
   ```powershell
   Get-Content server\security\RSAEncryption.js | Select-Object -First 100
   ```

2. **Expected Result:**
   - ✅ `class RSAEncryption` found
   - ✅ `generateKeyPair()` method
   - ✅ `encrypt()` method
   - ✅ `decrypt()` method
   - ✅ `isPrime()` - Miller-Rabin test
   - ✅ `modPow()` - Modular exponentiation
   - ✅ Uses `BigInt` (custom math, no crypto lib)

### Step 9.2: Verify ECC Implementation

1. **Check ECCEncryption.js:**
   ```powershell
   Get-Content server\security\ECCEncryption.js | Select-Object -First 100
   ```

2. **Expected Result:**
   - ✅ `class ECCEncryption` found
   - ✅ `generateKeyPair()` method
   - ✅ `encrypt()` method
   - ✅ `decrypt()` method
   - ✅ `pointMultiply()` - Elliptic curve operations
   - ✅ secp256k1 curve parameters

### Step 9.3: Verify NO Symmetric Encryption

1. **Search for AES:**
   ```powershell
   Select-String -Path "server\security\*.js" -Pattern "AES|aes"
   ```

2. **Expected Result:**
   - ✅ **NO MATCHES** (no AES used)

3. **Search for DES:**
   ```powershell
   Select-String -Path "server\security\*.js" -Pattern "DES|des|3des"
   ```

4. **Expected Result:**
   - ✅ **NO MATCHES** (no DES used)

5. **Search for ChaCha20:**
   ```powershell
   Select-String -Path "server\security\*.js" -Pattern "ChaCha|chacha"
   ```

6. **Expected Result:**
   - ✅ **NO MATCHES** (no ChaCha20 used)

7. **Check Encryption Service:**
   ```powershell
   Get-Content server\middlewares\encryptionService.js | Select-String -Pattern "new RSAEncryption|new ECCEncryption"
   ```

8. **Expected Result:**
   - ✅ Only RSA and ECC instantiated
   - ✅ No symmetric cipher instances

**✅ Requirement 9: PASS / FAIL**

---

## 🔒 Test 10: Multi-Level Encryption

### Step 10.1: Register for an Event (Creates Ticket)

1. **Navigate to:** `http://localhost:3000/dashboard`

2. **Find an Event and Click "Register"**

3. **Fill Ticket Information:**
   - Name: `John Doe`
   - Phone: `01712345678`
   - Department: `Computer Science`

4. **Submit Registration**

5. **Expected Result:**
   - ✅ Registration successful
   - ✅ Ticket created

### Step 10.2: Verify Multi-Level Encryption in Database

1. **Check Participant Data:**
   ```javascript
   db.events.findOne({}, {participants: 1})
   ```

2. **Expected Result:**
   ```javascript
   {
     participants: [{
       userId: ObjectId("..."),
       ticketId: "uuid-string",
       encryptedTicketData: "VERY_LONG_BASE64_STRING...",  // ✅ Double encrypted
       attended: false
     }]
   }
   ```

3. **Compare Encryption Length:**
   - Single RSA encryption: ~344 characters (2048-bit)
   - RSA + ECC encryption: ~600-800 characters (double layer)

4. **Verify Extremely Long String:**
   ```javascript
   db.events.findOne({}, {participants: 1}).participants[0].encryptedTicketData.length
   ```
   - **Expected:** > 500 characters (much longer than single encryption)

### Step 10.3: Verify Decryption Works

1. **Navigate to:** `http://localhost:3000/my-tickets`

2. **Expected Result:**
   - ✅ Your ticket displays correctly
   - ✅ Name: "John Doe" (decrypted)
   - ✅ Phone: "01712345678" (decrypted)
   - ✅ Department: "Computer Science" (decrypted)

### Step 10.4: Check Multi-Level Implementation

1. **Check EncryptionService:**
   ```powershell
   Get-Content server\middlewares\encryptionService.js | Select-String -Pattern "multiLevelEncrypt|multiLevelDecrypt"
   ```

2. **Expected Result:**
   - ✅ `multiLevelEncrypt()` method exists
   - ✅ `multiLevelDecrypt()` method exists

3. **Check Implementation:**
   ```powershell
   Get-Content server\middlewares\encryptionService.js | Select-String -Pattern "rsa.encrypt.*ecc.encrypt" -Context 2,2
   ```

4. **Expected Flow:**
   ```
   Plaintext → RSA Encrypt → ECC Encrypt → Double Ciphertext
   ```

**✅ Requirement 10: PASS / FAIL**

---

## 👥 Test 11: Role-Based Access Control (RBAC)

### Step 11.1: Test as Regular User

1. **Login as Regular User:**
   - Email: `john.doe@test.com`
   - Password: `SecurePass123!`

2. **Check Your Role:**
   ```javascript
   db.users.findOne({email: "john.doe@test.com"}, {role: 1})
   ```
   - **Expected:** `{ role: "user" }`

3. **Test Allowed Operations:**
   - ✅ Create event → Should work
   - ✅ Register for event → Should work
   - ✅ View own tickets → Should work
   - ✅ View own created events → Should work

4. **Create Another Event (By Different User):**
   - Register another user: `jane.smith@test.com`
   - Login as Jane
   - Create an event
   - Note the event ID

5. **Test Restricted Operations (as John):**
   - Try to view participants of Jane's event
   - Try to delete Jane's event
   - **Expected:** ❌ Access denied

### Step 11.2: Test Event Organizer Privileges

1. **Login as Event Creator:**
   - Login with account that created an event

2. **Test Organizer Operations:**
   - Navigate to "My Created Events"
   - Click on your event
   - **Expected Access:**
     - ✅ View participants list
     - ✅ Mark attendance
     - ✅ Edit event
     - ✅ Delete event (if no participants)

3. **Test Non-Organizer Restrictions:**
   - Login as different user
   - Try to access participants API directly:
   ```powershell
   $token = "DIFFERENT_USER_TOKEN"
   Invoke-RestMethod -Uri "http://localhost:8080/api/event/EVENT_ID/participants" -Headers @{Authorization="Bearer $token"}
   ```
   - **Expected:** ❌ 403 Forbidden "Only event organizer can view participants"

### Step 11.3: Test Admin Role (If Implemented)

1. **Create Admin User (Manually in Database):**
   ```javascript
   db.users.updateOne(
     {email: "john.doe@test.com"},
     {$set: {role: "admin"}}
   )
   ```

2. **Login as Admin**

3. **Test Admin Operations:**
   - Should have access to all events
   - Should be able to manage all users (if implemented)
   - Should see admin dashboard (if implemented)

### Step 11.4: Verify Middleware Implementation

1. **Check Auth Middleware:**
   ```powershell
   Get-Content server\middlewares\auth.js | Select-String -Pattern "requireRole|isLoggedIn"
   ```

2. **Expected Result:**
   - ✅ `isLoggedIn` middleware - Verifies authentication
   - ✅ `requireRole` middleware - Checks user role

**✅ Requirement 11: PASS / FAIL**

---

## 🛡️ Test 12: Secure Session Management

### Step 12.1: Test JWT Token Generation

1. **Login to EventShield:**
   - Email: `john.doe@test.com`
   - Password: `SecurePass123!`

2. **Open Browser DevTools (F12):**
   - Go to **Application** tab
   - Click **Local Storage**
   - Find `token` entry

3. **Copy Token and Decode at jwt.io:**
   - Go to `https://jwt.io`
   - Paste your token
   - **Expected Payload:**
   ```json
   {
     "id": "user_id",
     "email": "john.doe@test.com",
     "role": "user",
     "sessionId": "random_hex_string",
     "iat": 1234567890,
     "exp": 1234654290,  // 24 hours later
     "iss": "eventshield",
     "aud": "eventshield-users"
   }
   ```

4. **Verification:**
   - ✅ Token expires in 24 hours
   - ✅ Contains user ID and role
   - ✅ Contains unique sessionId
   - ✅ Signed (verify signature at bottom)

### Step 12.2: Test HTTP-Only Cookies

1. **Check Cookies (DevTools → Application → Cookies):**
   - Look for `token` cookie
   - **Expected Attributes:**
     - ✅ `HttpOnly`: true (not accessible via JavaScript)
     - ✅ `Secure`: true (HTTPS only in production)
     - ✅ `SameSite`: Strict (CSRF protection)

2. **Test XSS Protection:**
   - Open Browser Console
   - Try to access cookie:
   ```javascript
   document.cookie
   ```
   - **Expected:** Token is NOT visible (HttpOnly protection)

### Step 12.3: Test Session Expiration

1. **Get Current Token:**
   ```javascript
   localStorage.getItem('token')
   ```

2. **Wait 24+ Hours** (or modify token expiration for testing)

3. **Try to Access Protected Route:**
   - Navigate to `http://localhost:3000/dashboard`
   - **Expected:** ❌ Redirected to login (session expired)

### Step 12.4: Test Token Tampering Protection

1. **Get Your Valid Token:**
   ```javascript
   var token = localStorage.getItem('token')
   ```

2. **Tamper with Token:**
   ```javascript
   var parts = token.split('.')
   // Modify payload
   parts[1] = btoa(JSON.stringify({id: "fake_id", role: "admin"}))
   var tamperedToken = parts.join('.')
   localStorage.setItem('token', tamperedToken)
   ```

3. **Try to Access Protected Route:**
   - Refresh page
   - **Expected:** ❌ Redirected to login (invalid signature)

### Step 12.5: Test Session Hijacking Detection

1. **Check User Model:**
   ```javascript
   db.users.findOne({email: "john.doe@test.com"}, {
     lastUserAgent: 1,
     lastIpAddress: 1,
     lastActivity: 1
   })
   ```

2. **Expected Fields:**
   - ✅ `lastUserAgent`: Browser user agent string
   - ✅ `lastIpAddress`: IP address
   - ✅ `lastActivity`: Timestamp

3. **Test Detection:**
   - Login from Chrome
   - Copy token
   - Open Firefox
   - Use same token
   - **Expected:** Warning logged (different user agent)

### Step 12.6: Test Logout

1. **Click Logout Button**

2. **Verify Session Cleared:**
   ```javascript
   localStorage.getItem('token')
   localStorage.getItem('user')
   ```
   - **Expected:** Both are `null`

3. **Try to Access Protected Route:**
   - Navigate to `http://localhost:3000/dashboard`
   - **Expected:** ❌ Redirected to login

**✅ Requirement 12: PASS / FAIL**

---

## 📊 Final Results Summary

### Requirements Compliance

| # | Requirement | Result | Notes |
|---|-------------|--------|-------|
| 1 | Login & Registration | ⬜ PASS / ⬜ FAIL | |
| 2 | Encrypted User Info | ⬜ PASS / ⬜ FAIL | |
| 3 | Password Hashing & Salting | ⬜ PASS / ⬜ FAIL | |
| 4 | Two-Factor Authentication | ⬜ PASS / ⬜ FAIL | |
| 5 | Key Management | ⬜ PASS / ⬜ FAIL | |
| 6 | Encrypted CRUD Operations | ⬜ PASS / ⬜ FAIL | |
| 7 | All Data Encrypted at Rest | ⬜ PASS / ⬜ FAIL | |
| 8 | MAC for Data Integrity | ⬜ PASS / ⬜ FAIL | |
| 9 | Asymmetric Encryption Only | ⬜ PASS / ⬜ FAIL | |
| 10 | Multi-Level Encryption | ⬜ PASS / ⬜ FAIL | |
| 11 | Role-Based Access Control | ⬜ PASS / ⬜ FAIL | |
| 12 | Secure Session Management | ⬜ PASS / ⬜ FAIL | |

### Overall Compliance Score: ____/12

---

## 🐛 Issues Found During Testing

| Issue | Description | Severity | Status |
|-------|-------------|----------|--------|
| | | | |
| | | | |

---

## ✅ Testing Complete!

**Date Completed:** _______________  
**Tester Signature:** _______________

**EventShield is ready for submission:** ⬜ YES / ⬜ NO

**Additional Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
