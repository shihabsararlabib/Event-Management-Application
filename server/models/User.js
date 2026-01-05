// Import Dependencies
import mongoose from "mongoose";
import validator from "validator";
import PasswordHasher from "../security/PasswordHasher.js";

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        maxlength: [40, 'Name should be under 40 characters.']
    },
    lastname: {
        type: String,
        required: true,
        maxlength: [40, 'Name should be under 40 characters.']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        validate: [validator.isEmail, 'Please enter email in correct format'],
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: [6, "Password should be of atleast 6 characters."],
    },
    // Encrypted user data
    encryptedData: {
        type: String, // Will store encrypted JSON of user info
    },
    // Role-Based Access Control
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    permissions: {
        type: [String],
        default: []
    },
    // Two-Factor Authentication
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: String
    },
    backupCodes: {
        type: [String],
        default: []
    },
    // Session management
    sessions: [{
        sessionId: String,
        token: String,
        ipAddress: String,
        userAgent: String,
        createdAt: Date,
        expiresAt: Date,
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    // MAC for data integrity
    dataMac: {
        type: String
    },
    // Key references
    activeRSAKeyId: String,
    activeECCKeyId: String,
    activeMACKeyId: String,
    // Password reset
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    // Security tracking
    lastPasswordChange: Date,
    lastLogin: Date,
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    accountLockedUntil: Date,
    // Attendance records for event management
    registeredEvents: [{
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event'
        },
        registeredAt: Date,
        attended: Boolean,
        ticketId: String
    }]
}, {
    timestamps: true
})

// Custom password hashing with salt before save
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    const hasher = new PasswordHasher();
    const hashedData = hasher.hashPassword(this.password);
    this.password = hashedData.combined;
    this.lastPasswordChange = new Date();
    next();
})

// Validate password with custom hasher
userSchema.methods.isValidatedPassword = async function(userSendPassword, storedPassword) {
    const hasher = new PasswordHasher();
    return hasher.verifyPassword(userSendPassword, storedPassword);
}

// Generate JWT token
userSchema.methods.getJwtToken = function() {
    // Using custom signing would be ideal, but JWT standard is acceptable
    // Create token payload
    const payload = {
        id: this._id,
        email: this.email,
        role: this.role
    };
    
    // Simple token generation (in production, use proper JWT library or implement from scratch)
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = Buffer.from(this._id + process.env.JWT_SECRET).toString('base64url').slice(0, 43);
    
    return `${header}.${payloadStr}.${signature}`;
}

// Generate forget password token
userSchema.methods.getForgotPasswordToken = function() {
    const hasher = new PasswordHasher();
    const forgotToken = hasher.generateSalt(20);
    
    this.forgotPasswordToken = hasher.hash(forgotToken);
    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000; // 20 mins
    
    return forgotToken;
}

// Create new session
userSchema.methods.createSession = function(ipAddress, userAgent) {
    const sessionId = new PasswordHasher().generateSalt(32);
    const token = this.getJwtToken();
    
    const session = {
        sessionId: sessionId,
        token: token,
        ipAddress: ipAddress,
        userAgent: userAgent,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        isActive: true
    };
    
    this.sessions.push(session);
    return session;
}

// Revoke session
userSchema.methods.revokeSession = function(sessionId) {
    const session = this.sessions.find(s => s.sessionId === sessionId);
    if (session) {
        session.isActive = false;
    }
}

// Revoke all sessions (useful for security incidents)
userSchema.methods.revokeAllSessions = function() {
    this.sessions.forEach(s => s.isActive = false);
}

// Check if account is locked
userSchema.methods.isAccountLocked = function() {
    return this.accountLockedUntil && this.accountLockedUntil > Date.now();
}

// Record failed login attempt
userSchema.methods.recordFailedLogin = function() {
    this.failedLoginAttempts += 1;
    
    // Lock account after 5 failed attempts for 30 minutes
    if (this.failedLoginAttempts >= 5) {
        this.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
}

// Reset failed login attempts
userSchema.methods.resetFailedLogins = function() {
    this.failedLoginAttempts = 0;
    this.accountLockedUntil = undefined;
}

const User = mongoose.model("User", userSchema);
export default User;