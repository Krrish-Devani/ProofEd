import Admin from '../models/admin.model.js';
import University from '../models/university.model.js';
import { ExpressError } from '../lib/ExpressError.js';
import { wrapAsync } from '../lib/wrapAsync.js';
import jwt from 'jsonwebtoken';
import { sendApprovalEmail, sendRejectionEmail } from '../lib/emailService.js';
import { approveIssuer } from '../lib/blockchainService.js';

const generateAdminToken = (adminId) => {
    return jwt.sign({ id: adminId }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

// Admin Login
export const login = wrapAsync(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ExpressError(400, 'Email and password are required');
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
        throw new ExpressError(401, 'Invalid credentials');
    }

    // Compare password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
        throw new ExpressError(401, 'Invalid credentials');
    }

    // Generate token
    const token = generateAdminToken(admin._id);

    // Set cookie
    res.cookie('adminToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
        success: true,
        message: 'Login successful',
        data: {
            adminId: admin._id,
            username: admin.username,
            email: admin.email,
            token
        }
    });
});

// Admin Logout
export const logout = wrapAsync(async (req, res) => {
    res.clearCookie('adminToken');
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

// Get Admin Profile
export const getProfile = wrapAsync(async (req, res) => {
    res.json({
        success: true,
        data: {
            adminId: req.admin._id,
            username: req.admin.username,
            email: req.admin.email
        }
    });
});

// Step 5: Get Pending Universities (Admin Reviews)
export const getPendingUniversities = wrapAsync(async (req, res) => {
    const pendingUniversities = await University.find({ 
        status: 'pending',
        emailVerified: true,
        walletAddress: { $exists: true, $ne: null }
    })
    .select('-verificationToken -verificationTokenExpiry')
    .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: pendingUniversities.length,
        data: pendingUniversities.map(university => ({
            universityId: university._id,
            name: university.name,
            email: university.email,
            website: university.website,
            walletAddress: university.walletAddress,
            emailVerified: university.emailVerified,
            status: university.status,
            createdAt: university.createdAt,
            // Calculate email domain from email
            emailDomain: university.email.split('@')[1]
        }))
    });
});