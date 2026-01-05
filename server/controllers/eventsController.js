import Events from "../models/Events.js"
import User from "../models/User.js"
import bigPromise from "../middlewares/bigPromise.js"
import { encryptData, decryptData, getUserKeys } from "../middlewares/encryptionService.js"
import { uuid } from 'uuidv4'
import multer from 'multer'
import fs from "fs"

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
});
  
const upload = multer({ storage: storage });

// Create Event with encryption
export const createEvent = bigPromise(async(req, res, next) => {
  const userId = req.user.id; // From auth middleware
  const { data } = req.body;
  const eventData = JSON.parse(data);

  // Validate required fields
  if(!eventData.eventName || !eventData.description || !eventData.date){
    return res.status(400).json({
      success: false,
      message: "Event name, description, and date are required!"
    })
  }
  
  // Check for existing event
  const existingEvent = await Events.findOne({ eventName: eventData.eventName })
  if(existingEvent){
    return res.status(400).json({
      success: false,
      message: "Event with this name already exists!",
    })
  }

  // Get user's encryption keys
  const keys = await getUserKeys(userId);

  // Prepare sensitive event data for encryption
  const sensitiveData = {
    eventName: eventData.eventName,
    description: eventData.description,
    venue: eventData.venue || '',
    speakers: eventData.speakers || [],
    Prize: eventData.Prize || '',
    subEvents: eventData.subEvents || []
  };

  // Encrypt event data
  const { encryptedData, dataMac } = await encryptData(sensitiveData, keys);

  // Create event with encrypted data
  const event = new Events({
    eventName: eventData.eventName,
    description: eventData.description,
    date: eventData.date,
    venue: eventData.venue,
    subEvents: eventData.subEvents,
    speakers: eventData.speakers,
    Prize: eventData.Prize,
    certificateTemplate: eventData.certificateTemplate,
    Status: eventData.Status || 'upcoming',
    ticketStatus: eventData.ticketStatus || 'available',
    encryptedData: encryptedData,
    dataMac: dataMac,
    createdBy: userId,
    maxParticipants: eventData.maxParticipants || 1000,
    img: req.file ? {
      data: fs.readFileSync("uploads/" + req.file.filename),
      contentType: "image/png",
    } : undefined
  });

  await event.save();

  return res.status(201).json({
    success: true,
    message: "Event created successfully with encryption!",
    event: {
      id: event._id,
      eventName: event.eventName,
      date: event.date,
      venue: event.venue,
      Status: event.Status
    }
  })
});

// Get all events (public view - decrypted basic info)
export const getEvent = bigPromise(async(req, res, next) => {
  const events = await Events.find({})
    .populate('createdBy', 'firstname lastname email')
    .select('-encryptedData -dataMac -participants.encryptedTicketData -attendanceRecords');
  
  if(!events || events.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No events found"
    });
  }

  return res.status(200).json({
    success: true,
    message: "Events retrieved successfully",
    data: events
  })
});

// Get single event details (with decryption for authorized users)
export const getEventDetails = bigPromise(async(req, res, next) => {
  const { eventId } = req.params;
  const userId = req.user?.id;

  const event = await Events.findById(eventId)
    .populate('createdBy', 'firstname lastname email')
    .populate('participants.userId', 'firstname lastname email');

  if(!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found"
    });
  }

  // Check if user is organizer or registered participant
  const isOrganizer = event.createdBy._id.toString() === userId;
  const isParticipant = event.participants.some(p => p.userId._id.toString() === userId);

  let decryptedData = null;
  if(userId && (isOrganizer || isParticipant)) {
    try {
      const keys = await getUserKeys(userId);
      decryptedData = await decryptData(event.encryptedData, event.dataMac, keys);
    } catch(error) {
      console.log('Decryption failed:', error.message);
    }
  }

  return res.status(200).json({
    success: true,
    event: {
      ...event.toObject(),
      decryptedData: decryptedData,
      isOrganizer: isOrganizer,
      isRegistered: isParticipant,
      participantCount: event.participants.length
    }
  });
});

// Register for an event (generate encrypted ticket)
export const registerForEvent = bigPromise(async(req, res, next) => {
  const { eventId } = req.params;
  const userId = req.user.id;

  const event = await Events.findById(eventId);
  if(!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found"
    });
  }

  // Check if already registered
  const alreadyRegistered = event.participants.some(
    p => p.userId.toString() === userId
  );
  if(alreadyRegistered) {
    return res.status(400).json({
      success: false,
      message: "You are already registered for this event"
    });
  }

  // Check capacity
  if(event.participants.length >= event.maxParticipants) {
    return res.status(400).json({
      success: false,
      message: "Event is full. Registration closed."
    });
  }

  // Generate ticket
  const ticketId = uuid();
  const user = await User.findById(userId);
  
  // Get user's encryption keys
  const keys = await getUserKeys(userId);

  // Encrypt ticket data
  const ticketData = {
    ticketId: ticketId,
    userId: userId,
    eventId: eventId,
    userName: `${user.firstname} ${user.lastname}`,
    userEmail: user.email,
    eventName: event.eventName,
    eventDate: event.date,
    registeredAt: new Date(),
    qrCode: `TICKET-${ticketId}`
  };

  const { encryptedData: encryptedTicket } = await encryptData(ticketData, keys);

  // Add participant
  event.participants.push({
    userId: userId,
    registeredAt: new Date(),
    attended: false,
    ticketId: ticketId,
    encryptedTicketData: encryptedTicket
  });

  await event.save();

  return res.status(200).json({
    success: true,
    message: "Successfully registered for event!",
    ticket: {
      ticketId: ticketId,
      eventName: event.eventName,
      eventDate: event.date,
      venue: event.venue,
      encryptedTicketData: encryptedTicket
    }
  });
});

// Get user's registered events with tickets
export const getMyRegisteredEvents = bigPromise(async(req, res, next) => {
  const userId = req.user.id;

  const events = await Events.find({
    'participants.userId': userId
  }).populate('createdBy', 'firstname lastname email');

  if(!events || events.length === 0) {
    return res.status(200).json({
      success: true,
      message: "You haven't registered for any events yet",
      events: []
    });
  }

  // Get user's keys for decryption
  const keys = await getUserKeys(userId);

  // Extract and decrypt user's tickets
  const registeredEvents = await Promise.all(events.map(async (event) => {
    const participation = event.participants.find(
      p => p.userId.toString() === userId
    );

    let decryptedTicket = null;
    if(participation && participation.encryptedTicketData) {
      try {
        decryptedTicket = await decryptData(
          participation.encryptedTicketData, 
          '', // No MAC for ticket data in this implementation
          keys
        );
      } catch(error) {
        console.log('Ticket decryption failed:', error.message);
      }
    }

    return {
      eventId: event._id,
      eventName: event.eventName,
      description: event.description,
      date: event.date,
      venue: event.venue,
      Status: event.Status,
      registeredAt: participation?.registeredAt,
      attended: participation?.attended,
      ticketId: participation?.ticketId,
      ticket: decryptedTicket
    };
  }));

  return res.status(200).json({
    success: true,
    message: "Your registered events retrieved successfully",
    events: registeredEvents
  });
});

// Mark attendance (organizer only)
export const markAttendance = bigPromise(async(req, res, next) => {
  const { eventId } = req.params;
  const { userId: participantId, verificationMethod } = req.body;
  const organizerId = req.user.id;

  const event = await Events.findById(eventId);
  if(!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found"
    });
  }

  // Verify organizer
  if(event.createdBy.toString() !== organizerId) {
    return res.status(403).json({
      success: false,
      message: "Only event organizer can mark attendance"
    });
  }

  // Find participant
  const participant = event.participants.find(
    p => p.userId.toString() === participantId
  );

  if(!participant) {
    return res.status(404).json({
      success: false,
      message: "Participant not registered for this event"
    });
  }

  // Mark as attended
  participant.attended = true;

  // Add attendance record
  event.attendanceRecords.push({
    userId: participantId,
    checkInTime: new Date(),
    verificationMethod: verificationMethod || 'manual'
  });

  await event.save();

  return res.status(200).json({
    success: true,
    message: "Attendance marked successfully",
    participant: {
      userId: participantId,
      attended: true,
      checkInTime: new Date()
    }
  });
});

// Get event participants (organizer only)
export const getEventParticipants = bigPromise(async(req, res, next) => {
  const { eventId } = req.params;
  const userId = req.user.id;

  const event = await Events.findById(eventId)
    .populate('participants.userId', 'firstname lastname email')
    .populate('attendanceRecords.userId', 'firstname lastname email');

  if(!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found"
    });
  }

  // Verify organizer
  if(event.createdBy.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: "Only event organizer can view participants"
    });
  }

  const participantList = event.participants.map(p => ({
    userId: p.userId._id,
    name: `${p.userId.firstname} ${p.userId.lastname}`,
    email: p.userId.email,
    registeredAt: p.registeredAt,
    attended: p.attended,
    ticketId: p.ticketId
  }));

  return res.status(200).json({
    success: true,
    message: "Participants retrieved successfully",
    event: {
      eventName: event.eventName,
      date: event.date,
      totalParticipants: event.participants.length,
      attended: event.participants.filter(p => p.attended).length,
      maxParticipants: event.maxParticipants
    },
    participants: participantList,
    attendanceRecords: event.attendanceRecords
  });
});

// Get my created events (organizer view)
export const getMyCreatedEvents = bigPromise(async(req, res, next) => {
  const userId = req.user.id;

  const events = await Events.find({ createdBy: userId })
    .select('-encryptedData -participants.encryptedTicketData');

  return res.status(200).json({
    success: true,
    message: "Your created events retrieved successfully",
    events: events.map(event => ({
      ...event.toObject(),
      participantCount: event.participants.length,
      attendedCount: event.participants.filter(p => p.attended).length
    }))
  });
});

