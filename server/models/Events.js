import mongoose from "mongoose";
import validator from "validator";

const eventSchema = new mongoose.Schema({
    img: {
        data: Buffer,
        contentType: String,
    },
    eventName: {
        type: String,
        required: true,
        maxlength: [100, 'Event name should be under 100 characters.']
    },
    venue: {
        type: String,
        maxlength: [40, 'Please enter the venue name.']
    },
    subEvents: [{
        type: String,
        maxlength: [100, 'Sub-Event name should be under 100 characters.']
    }],
    description: {
        type: String,
        required: true,
        maxlength: [300, 'Whats the event is all about please describe.']
    },
    date: {
        type: Date,
        required: true,
    },
    speakers: [{
        type: String,
        maxlength: [20, 'Speaker name should be under 20 characters.']
    }],
    Prize: {
        type: String,
        maxlength: [100, 'Prize discription should be not be more then 100 characters.']
    },
    certificateTemplate: {
        type: String,
        maxlength: [100, 'Certificate template should not be more then 100 character.']
    },
    Status: {
        type: String,
        maxlength: [15, 'Status should should not be more then 15 character.']
    },
    ticketStatus: {
        type: String,
        maxlength: [15, 'Ticket Status should not be more then 15 character.']
    },
    // Security features
    encryptedData: {
        type: String, // Encrypted event details
    },
    dataMac: {
        type: String, // MAC for data integrity
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Participant management
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        registeredAt: Date,
        attended: Boolean,
        ticketId: String,
        encryptedTicketData: String
    }],
    maxParticipants: {
        type: Number,
        default: 1000
    },
    // Attendance tracking
    attendanceRecords: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        checkInTime: Date,
        checkOutTime: Date,
        verificationMethod: String
    }]
}, {
    timestamps: true
})

const Event = mongoose.model("Event", eventSchema);
export default Event;

