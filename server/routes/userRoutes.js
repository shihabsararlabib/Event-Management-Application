import express from "express";
const router = express.Router();

// Import controllers
import {
    createUser,
    login,
    logout,
    forgotPassword,
    getLoggedinUserDetails,
    changePassword,
    updateUserDetails,
    enable2FA,
    verify2FA,
    disable2FA,
    adminAllUsers,
    adminGetOneUser,
    adminUpdateUserRole,
    adminDeleteUser,
    getUserRegisteredEvents
} from "../controllers/userController.js";

// Import middleware
import { isLoggedIn, verify2FA as verify2FAMiddleware, validateSessionSecurity } from "../middlewares/auth.js";
import { requireRole, requirePermission } from "../middlewares/rbac.js";

// Public routes
router.route("/signup").post(createUser);
router.route("/login").post(login);
router.route("/forgotPassword").post(forgotPassword);

// Protected routes (require authentication)
router.route("/logout").post(isLoggedIn, logout);
router.route("/profile").get(isLoggedIn, validateSessionSecurity, getLoggedinUserDetails);
router.route("/password/change").post(isLoggedIn, validateSessionSecurity, changePassword);
router.route("/update").put(isLoggedIn, validateSessionSecurity, updateUserDetails);
router.route("/events/registered").get(isLoggedIn, validateSessionSecurity, getUserRegisteredEvents);

// 2FA routes
router.route("/2fa/enable").post(isLoggedIn, validateSessionSecurity, enable2FA);
router.route("/2fa/verify").post(isLoggedIn, verify2FA);
router.route("/2fa/disable").post(isLoggedIn, validateSessionSecurity, disable2FA);

// Admin routes (require admin role)
router.route("/admin/users").get(isLoggedIn, validateSessionSecurity, requireRole('admin'), adminAllUsers);
router.route("/admin/user/:id").get(isLoggedIn, validateSessionSecurity, requireRole('admin'), adminGetOneUser);
router.route("/admin/user/:id/role").put(isLoggedIn, validateSessionSecurity, requireRole('admin'), adminUpdateUserRole);
router.route("/admin/user/:id").delete(isLoggedIn, validateSessionSecurity, requireRole('admin'), adminDeleteUser);

export default router;
