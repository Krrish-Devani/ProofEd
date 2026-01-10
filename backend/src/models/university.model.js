import mongoose from "mongoose";

const universitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: /.+\@.+\..+/
    },

    website: {
        type: String,
        required: true,
    },

    walletAddress: {
        type: String,
        required: false,
        unique: true,
        sparse: true,
        lowercase: true,
    },

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },

    emailVerified: {
        type: Boolean,
        default: false
    },

    verificationToken: String,
    verificationTokenExpiry: Date,
    rejectionReason: String,
    approvedAt: Date,

}, { timestamps: true });

const University = mongoose.model('University', universitySchema);

export default University;