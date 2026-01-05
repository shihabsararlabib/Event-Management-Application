import express from "express"
import multer from "multer"
// Import controllers
import {
    createEvent,
    getEvent,
    getEventDetails,
    registerForEvent,
    getMyRegisteredEvents,
    markAttendance,
    getEventParticipants,
    getMyCreatedEvents
} from "../controllers/eventsController.js"

// Import middleware
import { isLoggedIn, validateSessionSecurity } from "../middlewares/auth.js"

const router = express.Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
});
  
const upload = multer({ storage: storage });

// Public routes
router.route("/").get(getEvent); // Browse all events (public)

// Protected routes (require authentication)
router.route("/create").post(isLoggedIn, validateSessionSecurity, upload.single("img"), createEvent); // Create event
router.route("/:eventId").get(isLoggedIn, getEventDetails); // Get single event details
router.route("/:eventId/register").post(isLoggedIn, validateSessionSecurity, registerForEvent); // Register for event
router.route("/my/registered").get(isLoggedIn, validateSessionSecurity, getMyRegisteredEvents); // Get user's registered events
router.route("/my/created").get(isLoggedIn, validateSessionSecurity, getMyCreatedEvents); // Get user's created events

// Organizer routes (event management)
router.route("/:eventId/participants").get(isLoggedIn, validateSessionSecurity, getEventParticipants); // View participants
router.route("/:eventId/attendance").post(isLoggedIn, validateSessionSecurity, markAttendance); // Mark attendance

export default router;
