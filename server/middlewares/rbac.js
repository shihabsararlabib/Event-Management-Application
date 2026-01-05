// Role-Based Access Control Middleware

const permissions = {
    admin: [
        'create:event',
        'read:event',
        'update:event',
        'delete:event',
        'manage:users',
        'view:all_attendance',
        'export:data',
        'manage:keys',
        'view:security_logs'
    ],
    user: [
        'register:event',
        'view:own_tickets',
        'view:events',
        'update:own_profile',
        'view:own_attendance'
    ]
};

// Check if user has required role
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Insufficient privileges'
            });
        }

        next();
    };
};

// Check if user has required permission
export const requirePermission = (...requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const userPermissions = permissions[req.user.role] || [];
        const hasPermission = requiredPermissions.some(permission => 
            userPermissions.includes(permission)
        );

        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Required permission not granted'
            });
        }

        next();
    };
};

// Get permissions for a role
export const getPermissionsForRole = (role) => {
    return permissions[role] || [];
};

// Check if role has permission
export const roleHasPermission = (role, permission) => {
    const rolePermissions = permissions[role] || [];
    return rolePermissions.includes(permission);
};

export default {
    requireRole,
    requirePermission,
    getPermissionsForRole,
    roleHasPermission
};
