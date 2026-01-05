// Import Models and Security Modules
import User from "../models/User.js";
import { cookieToken } from "../utils/cookieToken.js";
import { mailHelper } from "../utils/mailHelper.js";
import bigPromise from "../middlewares/bigPromise.js";
import EncryptionService from "../middlewares/encryptionService.js";
import TwoFactorAuth from "../security/TwoFactorAuth.js";
import MACGenerator from "../security/MACGenerator.js";

const encryptionService = new EncryptionService();
const tfa = new TwoFactorAuth();
const mac = new MACGenerator();

// User Registration with encryption
export const createUser = bigPromise(async (req, res, next) => {
    const { firstname, lastname, email, password } = req.body;
    
    if (!firstname || !lastname || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required!"
        });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "User with this email already exists"
        });
    }

    // Create user (password will be hashed automatically in pre-save hook)
    const user = await User.create({
        firstname,
        lastname,
        email,
        password,
        role: 'user' // Default role
    });

    // Encrypt user data after creation
    try {
        const encryptedData = await encryptionService.encryptUserInfo(user);
        user.encryptedData = JSON.stringify(encryptedData);
        
        // Generate MAC for data integrity
        const { macKey } = await encryptionService.getUserKeys(user._id);
        user.dataMac = mac.generateHMAC(user.encryptedData, macKey);
        
        await user.save();
    } catch (error) {
        console.error('Error encrypting user data:', error);
        // Still return error to client for debugging
        return res.status(400).json({
            success: false,
            message: "Error during user data encryption: " + error.message
        });
    }

    // Remove sensitive data from response
    const userResponse = {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
    };

    return res.status(201).json({
        success: true,
        message: "User created successfully! Please enable 2FA for enhanced security.",
        data: userResponse
    });
});

// Login with 2FA
export const login = bigPromise(async (req, res, next) => {
    const { email, password, twoFactorToken } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
        return res.status(401).json({
            success: false,
            message: "Invalid credentials"
        });
    }

    // Check if account is locked
    if (existingUser.isAccountLocked()) {
        return res.status(423).json({
            success: false,
            message: "Account temporarily locked due to failed login attempts",
            lockedUntil: existingUser.accountLockedUntil
        });
    }

    // Verify password
    const isPasswordCorrect = await existingUser.isValidatedPassword(password, existingUser.password);

    if (!isPasswordCorrect) {
        existingUser.recordFailedLogin();
        await existingUser.save();
        
        return res.status(401).json({
            success: false,
            message: "Invalid credentials",
            remainingAttempts: Math.max(0, 5 - existingUser.failedLoginAttempts)
        });
    }

    // Check 2FA if enabled
    if (existingUser.twoFactorEnabled) {
        if (!twoFactorToken) {
            return res.status(403).json({
                success: false,
                message: "2FA token required",
                requires2FA: true
            });
        }

        const isValidToken = tfa.verifyTOTP(twoFactorToken, existingUser.twoFactorSecret);
        
        if (!isValidToken) {
            // Check backup codes
            const backupCodeIndex = tfa.verifyBackupCode(twoFactorToken, existingUser.backupCodes);
            
            if (backupCodeIndex === -1) {
                existingUser.recordFailedLogin();
                await existingUser.save();
                
                return res.status(403).json({
                    success: false,
                    message: "Invalid 2FA token"
                });
            }
            
            // Remove used backup code
            existingUser.backupCodes.splice(backupCodeIndex, 1);
        }
    }

    // Reset failed login attempts
    existingUser.resetFailedLogins();
    existingUser.lastLogin = new Date();

    // Create secure session
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const session = existingUser.createSession(ipAddress, userAgent);
    
    await existingUser.save();

    // Set cookie with token
    res.cookie('token', session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return res.status(200).json({
        success: true,
        message: "Login successful",
        token: session.token,
        user: {
            _id: existingUser._id,
            firstname: existingUser.firstname,
            lastname: existingUser.lastname,
            email: existingUser.email,
            role: existingUser.role,
            twoFactorEnabled: existingUser.twoFactorEnabled
        }
    });
});

// Logout
export const logout = bigPromise(async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (token && req.user) {
        // Find and revoke the session
        const session = req.user.sessions.find(s => s.token === token);
        if (session) {
            req.user.revokeSession(session.sessionId);
            await req.user.save();
        }
    }

    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });
    
    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
});

// Enable 2FA
export const enable2FA = bigPromise(async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if (req.user.twoFactorEnabled) {
        return res.status(400).json({
            success: false,
            message: "2FA is already enabled"
        });
    }

    // Generate secret
    const secret = tfa.generateSecret();
    
    // Generate QR code data
    const qrData = tfa.generateQRCodeData(secret, req.user.email, 'EventShield');
    
    // Generate backup codes
    const backupCodes = tfa.generateBackupCodes();

    // Save to user (but don't enable yet - user must verify first)
    req.user.twoFactorSecret = secret;
    req.user.backupCodes = backupCodes;
    await req.user.save();

    return res.status(200).json({
        success: true,
        message: "2FA setup initiated. Please scan QR code and verify.",
        secret: secret,
        qrCodeData: qrData,
        backupCodes: backupCodes
    });
});

// Verify and activate 2FA
export const verify2FA = bigPromise(async (req, res, next) => {
    const { twoFactorToken } = req.body;

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if (!twoFactorToken) {
        return res.status(400).json({
            success: false,
            message: "2FA token required"
        });
    }

    if (!req.user.twoFactorSecret) {
        return res.status(400).json({
            success: false,
            message: "Please initiate 2FA setup first"
        });
    }

    // Verify token
    const isValid = tfa.verifyTOTP(twoFactorToken, req.user.twoFactorSecret);

    if (!isValid) {
        return res.status(403).json({
            success: false,
            message: "Invalid 2FA token"
        });
    }

    // Enable 2FA
    req.user.twoFactorEnabled = true;
    await req.user.save();

    return res.status(200).json({
        success: true,
        message: "2FA enabled successfully"
    });
});

// Disable 2FA
export const disable2FA = bigPromise(async (req, res, next) => {
    const { password, twoFactorToken } = req.body;

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if (!password || !twoFactorToken) {
        return res.status(400).json({
            success: false,
            message: "Password and 2FA token required"
        });
    }

    // Verify password
    const isPasswordCorrect = await req.user.isValidatedPassword(password, req.user.password);
    if (!isPasswordCorrect) {
        return res.status(401).json({
            success: false,
            message: "Invalid password"
        });
    }

    // Verify 2FA token
    const isValid = tfa.verifyTOTP(twoFactorToken, req.user.twoFactorSecret);
    if (!isValid) {
        return res.status(403).json({
            success: false,
            message: "Invalid 2FA token"
        });
    }

    // Disable 2FA
    req.user.twoFactorEnabled = false;
    req.user.twoFactorSecret = undefined;
    req.user.backupCodes = [];
    await req.user.save();

    return res.status(200).json({
        success: true,
        message: "2FA disabled successfully"
    });
});

// Forgot Password
export const forgotPassword = bigPromise(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
        return res.status(400).json({
            success: false,
            message: "No user is registered with this email"
        });
    }
    
    const forgotToken = await user.getForgotPasswordToken();
    await user.save({ validateBeforeSave: false });

    const myUrl = `${req.protocol}://${req.get('host')}/api/user/password/reset/${forgotToken}`;
    const message = `Copy paste this link in your URL and hit enter \n\n ${myUrl}`;

    try {
        await mailHelper({
            email: user.email,
            subject: "EventShield - Password Reset Email",
            message: message
        });

        res.status(200).json({
            success: true,
            message: "Email sent successfully!"
        });
    } catch (error) {
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        await user.save({ validateBeforeSave: false });

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get logged in user details with decrypted data
export const getLoggedinUserDetails = bigPromise(async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    const user = await User.findById(req.user._id);

    // Decrypt user data if available
    let decryptedData = null;
    if (user.encryptedData) {
        try {
            const encryptedData = JSON.parse(user.encryptedData);
            decryptedData = await encryptionService.decryptData(encryptedData, user._id);
        } catch (error) {
            console.error('Error decrypting user data:', error);
        }
    }

    res.status(200).json({
        success: true,
        user: {
            _id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role,
            twoFactorEnabled: user.twoFactorEnabled,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            decryptedData: decryptedData
        }
    });
});

// Change Password
export const changePassword = bigPromise(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if (!oldPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Old password and new password required"
        });
    }

    const user = await User.findById(req.user._id);
    
    // Verify old password
    const isValid = await user.isValidatedPassword(oldPassword, user.password);
    if (!isValid) {
        return res.status(400).json({
            success: false,
            message: "Old password is incorrect"
        });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Password changed successfully"
    });
});

// Update User Details
export const updateUserDetails = bigPromise(async (req, res, next) => {
    const { firstname, lastname, email } = req.body;

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    const newData = {};
    if (firstname) newData.firstname = firstname;
    if (lastname) newData.lastname = lastname;
    if (email) newData.email = email;

    const updated = await User.findByIdAndUpdate(req.user._id, newData, {
        new: true,
        runValidators: true
    });

    // Re-encrypt user data
    try {
        const encryptedData = await encryptionService.encryptUserInfo(updated);
        updated.encryptedData = JSON.stringify(encryptedData);
        
        const { macKey } = await encryptionService.getUserKeys(updated._id);
        updated.dataMac = mac.generateHMAC(updated.encryptedData, macKey);
        
        await updated.save();
    } catch (error) {
        console.error('Error re-encrypting user data:', error);
    }

    res.status(200).json({
        success: true,
        message: "User details updated successfully",
        user: {
            _id: updated._id,
            firstname: updated.firstname,
            lastname: updated.lastname,
            email: updated.email,
            role: updated.role
        }
    });
});

// Admin: Get all users
export const adminAllUsers = bigPromise(async (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: "Access denied: Admin privileges required"
        });
    }

    const users = await User.find().select('-password -twoFactorSecret -backupCodes -sessions');
    
    res.status(200).json({
        success: true,
        count: users.length,
        users
    });
});

// Admin: Get one user
export const adminGetOneUser = bigPromise(async (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: "Access denied: Admin privileges required"
        });
    }

    const user = await User.findById(req.params.id).select('-password -twoFactorSecret -backupCodes');
    
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    res.status(200).json({
        success: true,
        user
    });
});

// Admin: Update user role
export const adminUpdateUserRole = bigPromise(async (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: "Access denied: Admin privileges required"
        });
    }

    const { role } = req.body;
    
    if (!role || !['admin', 'user'].includes(role)) {
        return res.status(400).json({
            success: false,
            message: "Valid role required (admin or user)"
        });
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { role: role },
        { new: true, runValidators: true }
    );

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    res.status(200).json({
        success: true,
        message: "User role updated successfully",
        user: {
            _id: user._id,
            email: user.email,
            role: user.role
        }
    });
});

// Admin: Delete user
export const adminDeleteUser = bigPromise(async (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: "Access denied: Admin privileges required"
        });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    res.status(200).json({
        success: true,
        message: "User deleted successfully"
    });
});

// Get user's registered events
export const getUserRegisteredEvents = bigPromise(async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    const user = await User.findById(req.user._id).populate('registeredEvents.eventId');

    res.status(200).json({
        success: true,
        registeredEvents: user.registeredEvents
    });
});