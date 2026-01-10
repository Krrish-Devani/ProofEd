import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: true,
        trim: true
    },

    studentId: {
        type: String,
        required: true,
        unique: true,
        sparse: true,
        lowercase: true,
    },

    studentEmail: {
        type: String,
        required: true,
        unique: true,
        sparse: true,
        lowercase: true,
        match: /.+\@.+\..+/
    },

    course: {
        type: String,
        required: true,
        trim: true
    },

    grade: {
        type: String,
        required: true,
    },

    issueDate: {
        type: Date,
        required: true,
        default: Date.now
    },

    universityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'University',
        required: true
    },

    certificateHash: {
        type: String,
        required: true,
        unique: true
    },

    transactionHash: {
        type: String,
        unique: true,
        sparse: true
    },

    qrCode: String,
    blockchainVerified: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;