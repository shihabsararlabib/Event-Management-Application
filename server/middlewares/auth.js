// Authentication Middleware with 2FA and session management

import User from "../models/User.js";
import TwoFactorAuth from "../security/TwoFactorAuth.js";
import bigPromise from "./bigPromise.js";

// Verify JWT token and load user
export const isLoggedIn = bigPromise(async (req, res, next) => {
    // Get token from header or cookie
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required: No token provided'
        });
    }

    try {
        // Parse token (simple parsing - in production use proper JWT verification)
        const parts = token.split('.');
        if (parts.length !== 3) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token format'
            });
        }

        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
        
        // Find user and verify session
        const user = await User.findById(payload.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if account is locked
        if (user.isAccountLocked()) {
            return res.status(423).json({
                success: false,
                message: 'Account is temporarily locked due to failed login attempts',
                lockedUntil: user.accountLockedUntil
            });
        }

        // Verify session is active
        const session = user.sessions.find(s => s.token === token && s.isActive);
        if (!session) {
            return res.status(401).json({
                success: false,
                message: 'Session expired or invalid'
            });
        }

        // Check session expiration
        if (new Date() > session.expiresAt) {
            session.isActive = false;
            await user.save();
            return res.status(401).json({
                success: false,
                message: 'Session expired'
            });
        }

        req.user = user;
        req.session = session;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
            error: error.message
        });
    }
});

// Verify 2FA token
export const verify2FA = bigPromise(async (req, res, next) => {
    const { twoFactorToken } = req.body;

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    // Skip if 2FA not enabled
    if (!req.user.twoFactorEnabled) {
        return next();
    }

    if (!twoFactorToken) {
        return res.status(403).json({
            success: false,
            message: '2FA token required',
            requires2FA: true
        });
    }

    const tfa = new TwoFactorAuth();
    
    // Verify TOTP token
    const isValid = tfa.verifyTOTP(twoFactorToken, req.user.twoFactorSecret);
    
    if (!isValid) {
        // Check backup codes
        const backupCodeIndex = tfa.verifyBackupCode(twoFactorToken, req.user.backupCodes);
        
        if (backupCodeIndex !== -1) {
            // Remove used backup code
            req.user.backupCodes.splice(backupCodeIndex, 1);
            await req.user.save();
            return next();
        }

        // Record failed attempt
        req.user.recordFailedLogin();
        await req.user.save();

        return res.status(403).json({
            success: false,
            message: 'Invalid 2FA token'
        });
    }

    next();
});

// Prevent session hijacking
export const validateSessionSecurity = bigPromise(async (req, res, next) => {
    if (!req.user || !req.session) {
        return next();
    }

    const currentIP = req.ip || req.connection.remoteAddress;
    const currentUserAgent = req.headers['user-agent'];

    // Check if IP address matches
    if (req.session.ipAddress !== currentIP) {
        // Suspicious activity - revoke session
        req.user.revokeSession(req.session.sessionId);
        await req.user.save();

        return res.status(403).json({
            success: false,
            message: 'Session security violation: IP address mismatch'
        });
    }

    // Check if user agent matches
    if (req.session.userAgent !== currentUserAgent) {
        // Suspicious activity - revoke session
        req.user.revokeSession(req.session.sessionId);
        await req.user.save();

        return res.status(403).json({
            success: false,
            message: 'Session security violation: User agent mismatch'
        });
    }

    next();
});

export default {
    isLoggedIn,
    verify2FA,
    validateSessionSecurity
};
