# EventShield API Documentation

## Base URL
```
Development: http://localhost:4000/api
Production: https://your-domain.com/api
```

## Authentication
Most endpoints require authentication via JWT token in either:
- **Authorization Header**: `Bearer <token>`
- **Cookie**: `token=<token>`

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## Endpoints

## 1. User Authentication

### Register User
Creates a new user account with encrypted data storage.

**Endpoint**: `POST /user/signup`  
**Auth Required**: No

**Request Body**:
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "User created successfully! Please enable 2FA for enhanced security.",
  "data": {
    "_id": "user_id",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2026-01-04T..."
  }
}
```

**Errors**:
- `400`: Missing required fields
- `400`: User already exists

---

### Login
Authenticates user and creates secure session.

**Endpoint**: `POST /user/login`  
**Auth Required**: No

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "twoFactorToken": "123456"  // Required if 2FA enabled
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "role": "user",
    "twoFactorEnabled": false
  }
}
```

**Errors**:
- `400`: Missing credentials
- `401`: Invalid credentials
- `403`: 2FA token required
- `403`: Invalid 2FA token
- `423`: Account locked

**Notes**:
- Sets HTTP-only cookie with token
- Creates session tied to IP and user-agent
- Account locks after 5 failed attempts for 30 minutes

---

### Logout
Terminates current session.

**Endpoint**: `POST /user/logout`  
**Auth Required**: Yes

**Response** (200):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Notes**:
- Revokes current session
- Clears authentication cookie

---

## 2. Two-Factor Authentication

### Enable 2FA
Initiates 2FA setup for user account.

**Endpoint**: `POST /user/2fa/enable`  
**Auth Required**: Yes

**Response** (200):
```json
{
  "success": true,
  "message": "2FA setup initiated. Please scan QR code and verify.",
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCodeData": "otpauth://totp/EventShield:john@example.com?secret=JBSWY3DPEHPK3PXP&issuer=EventShield",
  "backupCodes": [
    "1234-5678",
    "9012-3456",
    ...
  ]
}
```

**Errors**:
- `400`: 2FA already enabled

**Notes**:
- Secret is base32 encoded
- QR code data can be used to generate QR image
- Save backup codes securely
- 2FA not active until verified

---

### Verify 2FA
Activates 2FA after verifying TOTP token.

**Endpoint**: `POST /user/2fa/verify`  
**Auth Required**: Yes

**Request Body**:
```json
{
  "twoFactorToken": "123456"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "2FA enabled successfully"
}
```

**Errors**:
- `400`: Token required
- `400`: Setup not initiated
- `403`: Invalid token

---

### Disable 2FA
Removes 2FA from user account.

**Endpoint**: `POST /user/2fa/disable`  
**Auth Required**: Yes

**Request Body**:
```json
{
  "password": "CurrentPassword123!",
  "twoFactorToken": "123456"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "2FA disabled successfully"
}
```

**Errors**:
- `400`: Password and token required
- `401`: Invalid password
- `403`: Invalid 2FA token

---

## 3. User Profile

### Get User Profile
Retrieves current user's profile with decrypted data.

**Endpoint**: `GET /user/profile`  
**Auth Required**: Yes

**Response** (200):
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "role": "user",
    "twoFactorEnabled": true,
    "lastLogin": "2026-01-04T...",
    "createdAt": "2026-01-01T...",
    "decryptedData": {
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com"
    }
  }
}
```

**Notes**:
- Automatically decrypts user data
- Verifies MAC before decryption
- Session security validated

---

### Update Profile
Updates user profile information with re-encryption.

**Endpoint**: `PUT /user/update`  
**Auth Required**: Yes

**Request Body**:
```json
{
  "firstname": "John",
  "lastname": "Smith",
  "email": "john.smith@example.com"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "User details updated successfully",
  "user": {
    "_id": "user_id",
    "firstname": "John",
    "lastname": "Smith",
    "email": "john.smith@example.com",
    "role": "user"
  }
}
```

**Notes**:
- Data automatically re-encrypted
- New MAC generated

---

### Change Password
Updates user password with verification.

**Endpoint**: `POST /user/password/change`  
**Auth Required**: Yes

**Request Body**:
```json
{
  "oldPassword": "CurrentPassword123!",
  "newPassword": "NewPassword456!"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Errors**:
- `400`: Both passwords required
- `400`: Old password incorrect

**Notes**:
- New password hashed with salt
- All sessions remain active

---

### Forgot Password
Initiates password reset process.

**Endpoint**: `POST /user/forgotPassword`  
**Auth Required**: No

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Email sent successfully!"
}
```

**Errors**:
- `400`: Email not registered

**Notes**:
- Reset link sent via email
- Token expires in 20 minutes

---

### Get Registered Events
Lists events user has registered for.

**Endpoint**: `GET /user/events/registered`  
**Auth Required**: Yes

**Response** (200):
```json
{
  "success": true,
  "registeredEvents": [
    {
      "eventId": "event_id",
      "registeredAt": "2026-01-02T...",
      "attended": false,
      "ticketId": "ticket_id"
    }
  ]
}
```

---

## 4. Admin Operations

### List All Users
Retrieves all users in the system.

**Endpoint**: `GET /user/admin/users`  
**Auth Required**: Yes (Admin only)  
**Permission**: `manage:users`

**Response** (200):
```json
{
  "success": true,
  "count": 50,
  "users": [
    {
      "_id": "user_id",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2026-01-01T..."
    }
  ]
}
```

**Errors**:
- `403`: Admin privileges required

**Notes**:
- Sensitive fields excluded (password, secrets)

---

### Get Single User
Retrieves detailed information about specific user.

**Endpoint**: `GET /user/admin/user/:id`  
**Auth Required**: Yes (Admin only)  
**Permission**: `manage:users`

**Parameters**:
- `id` (path): User ID

**Response** (200):
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "role": "user",
    "twoFactorEnabled": true,
    "lastLogin": "2026-01-04T...",
    "createdAt": "2026-01-01T...",
    "registeredEvents": [...]
  }
}
```

**Errors**:
- `403`: Admin privileges required
- `404`: User not found

---

### Update User Role
Changes user's role (admin/user).

**Endpoint**: `PUT /user/admin/user/:id/role`  
**Auth Required**: Yes (Admin only)  
**Permission**: `manage:users`

**Parameters**:
- `id` (path): User ID

**Request Body**:
```json
{
  "role": "admin"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "User role updated successfully",
  "user": {
    "_id": "user_id",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

**Errors**:
- `400`: Invalid role
- `403`: Admin privileges required
- `404`: User not found

**Valid Roles**:
- `admin`
- `user`

---

### Delete User
Permanently removes user from system.

**Endpoint**: `DELETE /user/admin/user/:id`  
**Auth Required**: Yes (Admin only)  
**Permission**: `manage:users`

**Parameters**:
- `id` (path): User ID

**Response** (200):
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Errors**:
- `403`: Admin privileges required
- `404`: User not found

**Notes**:
- Cascades to delete user's keys
- Removes from all events

---

## 5. Events (To be fully implemented)

### List Events
**Endpoint**: `GET /event`  
**Auth Required**: No

### Get Event Details
**Endpoint**: `GET /event/:id`  
**Auth Required**: No

### Create Event
**Endpoint**: `POST /event`  
**Auth Required**: Yes (Admin only)

### Update Event
**Endpoint**: `PUT /event/:id`  
**Auth Required**: Yes (Admin only)

### Delete Event
**Endpoint**: `DELETE /event/:id`  
**Auth Required**: Yes (Admin only)

### Register for Event
**Endpoint**: `POST /event/:id/register`  
**Auth Required**: Yes

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Permission denied |
| 404 | Not Found - Resource not found |
| 423 | Locked - Account locked |
| 500 | Internal Server Error |

---

## Security Headers

### Required Headers for Protected Routes
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Session Security
All authenticated requests validate:
- IP address matches session
- User-agent matches session
- Token not expired
- Account not locked

---

## Rate Limiting

### Login Endpoint
- 5 attempts per IP per 15 minutes
- Account locks after 5 failed attempts
- 30-minute lockout period

### API Endpoints
- 100 requests per IP per minute (recommended)

---

## Examples

### cURL Examples

#### Register User
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

#### Login
```bash
curl -X POST http://localhost:4000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

#### Get Profile
```bash
curl -X GET http://localhost:4000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Enable 2FA
```bash
curl -X POST http://localhost:4000/api/user/2fa/enable \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

#### Admin - List Users
```bash
curl -X GET http://localhost:4000/api/user/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### JavaScript/Fetch Examples

#### Login
```javascript
const response = await fetch('http://localhost:4000/api/user/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'SecurePassword123!'
  }),
  credentials: 'include'  // Include cookies
});

const data = await response.json();
console.log(data.token);
```

#### Get Profile
```javascript
const response = await fetch('http://localhost:4000/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  },
  credentials: 'include'
});

const data = await response.json();
console.log(data.user);
```

### Axios Examples

#### Setup
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true
});

// Add token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### Usage
```javascript
// Register
const registerUser = async (userData) => {
  const response = await api.post('/user/signup', userData);
  return response.data;
};

// Login
const login = async (email, password, twoFactorToken) => {
  const response = await api.post('/user/login', {
    email,
    password,
    twoFactorToken
  });
  localStorage.setItem('token', response.data.token);
  return response.data;
};

// Get Profile
const getProfile = async () => {
  const response = await api.get('/user/profile');
  return response.data.user;
};

// Enable 2FA
const enable2FA = async () => {
  const response = await api.post('/user/2fa/enable');
  return response.data;
};
```

---

## Webhooks (Future)

### Event Registration
Notify external systems when user registers for event.

### Key Rotation
Alert when keys are automatically rotated.

### Security Events
Notify on suspicious activity (failed logins, hijacking attempts).

---

---

## 5. Event Management

### Browse All Events
Get list of all available events (public access).

**Endpoint**: `GET /event`  
**Auth Required**: No

**Response**:
```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "data": [
    {
      "_id": "event123",
      "eventName": "Tech Conference 2026",
      "description": "Annual technology conference",
      "date": "2026-03-15T00:00:00.000Z",
      "venue": "Convention Center",
      "Status": "upcoming",
      "ticketStatus": "available",
      "createdBy": {
        "firstname": "John",
        "lastname": "Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

### Get Event Details
Get detailed information about a specific event.

**Endpoint**: `GET /event/:eventId`  
**Auth Required**: Yes

**Response**:
```json
{
  "success": true,
  "event": {
    "_id": "event123",
    "eventName": "Tech Conference 2026",
    "description": "Annual technology conference",
    "date": "2026-03-15T00:00:00.000Z",
    "venue": "Convention Center",
    "speakers": ["Dr. Smith", "Prof. Johnson"],
    "maxParticipants": 500,
    "isOrganizer": false,
    "isRegistered": true,
    "participantCount": 234,
    "decryptedData": {
      "eventName": "Tech Conference 2026",
      "description": "Full event details..."
    }
  }
}
```

### Create Event
Create a new event with encryption (requires authentication).

**Endpoint**: `POST /event/create`  
**Auth Required**: Yes  
**Content-Type**: `multipart/form-data`

**Request Body**:
```json
{
  "data": {
    "eventName": "Tech Conference 2026",
    "description": "Annual technology conference with industry leaders",
    "date": "2026-03-15",
    "venue": "Convention Center Hall A",
    "speakers": ["Dr. Smith", "Prof. Johnson"],
    "Prize": "Certificates and Goodies",
    "subEvents": ["Workshop 1", "Panel Discussion"],
    "maxParticipants": 500,
    "Status": "upcoming",
    "ticketStatus": "available"
  },
  "img": "<file>"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Event created successfully with encryption!",
  "event": {
    "id": "event123",
    "eventName": "Tech Conference 2026",
    "date": "2026-03-15T00:00:00.000Z",
    "venue": "Convention Center Hall A",
    "Status": "upcoming"
  }
}
```

### Register for Event
Register for an event and receive encrypted ticket.

**Endpoint**: `POST /event/:eventId/register`  
**Auth Required**: Yes

**Response**:
```json
{
  "success": true,
  "message": "Successfully registered for event!",
  "ticket": {
    "ticketId": "uuid-v4-string",
    "eventName": "Tech Conference 2026",
    "eventDate": "2026-03-15T00:00:00.000Z",
    "venue": "Convention Center Hall A",
    "encryptedTicketData": "encrypted-ticket-string"
  }
}
```

**Error Responses**:
- `400`: Already registered or event is full
- `404`: Event not found

### Get My Registered Events
View all events you've registered for with tickets.

**Endpoint**: `GET /event/my/registered`  
**Auth Required**: Yes

**Response**:
```json
{
  "success": true,
  "message": "Your registered events retrieved successfully",
  "events": [
    {
      "eventId": "event123",
      "eventName": "Tech Conference 2026",
      "description": "Annual technology conference",
      "date": "2026-03-15T00:00:00.000Z",
      "venue": "Convention Center",
      "Status": "upcoming",
      "registeredAt": "2026-01-05T10:30:00.000Z",
      "attended": false,
      "ticketId": "uuid-string",
      "ticket": {
        "ticketId": "uuid-string",
        "userName": "John Doe",
        "userEmail": "john@example.com",
        "eventName": "Tech Conference 2026",
        "qrCode": "TICKET-uuid-string"
      }
    }
  ]
}
```

### Get My Created Events
View all events you've created as organizer.

**Endpoint**: `GET /event/my/created`  
**Auth Required**: Yes

**Response**:
```json
{
  "success": true,
  "message": "Your created events retrieved successfully",
  "events": [
    {
      "_id": "event123",
      "eventName": "Tech Conference 2026",
      "date": "2026-03-15T00:00:00.000Z",
      "venue": "Convention Center",
      "Status": "upcoming",
      "participantCount": 234,
      "attendedCount": 180,
      "maxParticipants": 500
    }
  ]
}
```

### Get Event Participants
View all participants for your event (organizer only).

**Endpoint**: `GET /event/:eventId/participants`  
**Auth Required**: Yes (Organizer only)

**Response**:
```json
{
  "success": true,
  "message": "Participants retrieved successfully",
  "event": {
    "eventName": "Tech Conference 2026",
    "date": "2026-03-15T00:00:00.000Z",
    "totalParticipants": 234,
    "attended": 180,
    "maxParticipants": 500
  },
  "participants": [
    {
      "userId": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "registeredAt": "2026-01-05T10:30:00.000Z",
      "attended": true,
      "ticketId": "uuid-string"
    }
  ],
  "attendanceRecords": [
    {
      "userId": "user123",
      "checkInTime": "2026-03-15T09:00:00.000Z",
      "verificationMethod": "QR Code"
    }
  ]
}
```

**Error Response**:
- `403`: Only event organizer can view participants

### Mark Attendance
Mark a participant as attended (organizer only).

**Endpoint**: `POST /event/:eventId/attendance`  
**Auth Required**: Yes (Organizer only)

**Request Body**:
```json
{
  "userId": "user123",
  "verificationMethod": "QR Code"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "participant": {
    "userId": "user123",
    "attended": true,
    "checkInTime": "2026-03-15T09:00:00.000Z"
  }
}
```

**Error Responses**:
- `403`: Only event organizer can mark attendance
- `404`: Participant not registered for event

---

## 6. Usage Examples

### Event Registration Flow

**Step 1: Browse Events**
```bash
curl http://localhost:4000/api/event
```

**Step 2: Register for Event**
```bash
curl -X POST http://localhost:4000/api/event/event123/register \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Step 3: View Your Ticket**
```bash
curl http://localhost:4000/api/event/my/registered \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Organizer Flow

**Step 1: Create Event**
```bash
curl -X POST http://localhost:4000/api/event/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F 'data={"eventName":"My Event","description":"Great event","date":"2026-03-15","venue":"Hall A"}' \
  -F 'img=@event-poster.png'
```

**Step 2: View Participants**
```bash
curl http://localhost:4000/api/event/event123/participants \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Step 3: Mark Attendance**
```bash
curl -X POST http://localhost:4000/api/event/event123/attendance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user123","verificationMethod":"QR Code"}'
```

---

## Versioning

Current API Version: **v1**

Version included in URL: `/api/v1/...` (optional)

Breaking changes will increment major version.

---

## Support

For API issues or questions:
1. Check this documentation
2. Review SECURITY.md for implementation details
3. See SETUP.md for configuration help
4. Check server logs for detailed errors
5. Open GitHub issue with:
   - Endpoint used
   - Request payload
   - Response received
   - Expected behavior

---

**EventShield API** - Secure, Encrypted, Authenticated

Last Updated: January 5, 2026
