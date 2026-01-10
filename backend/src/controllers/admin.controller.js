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