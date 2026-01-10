import Admin from '../models/admin.model.js';
import University from '../models/university.model.js';
import { ExpressError } from '../lib/ExpressError.js';
import { wrapAsync } from '../lib/wrapAsync.js';
import jwt from 'jsonwebtoken';
import { sendApprovalEmail, sendRejectionEmail } from '../lib/emailService.js';

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

// Get All Universities (with filters)
export const getAllUniversities = wrapAsync(async (req, res) => {
    const { status } = req.query; // Can filter by: pending, approved, rejected

    const query = {};
    if (status) {
        query.status = status;
    }

    const universities = await University.find(query)
        .select('-verificationToken -verificationTokenExpiry')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: universities.length,
        data: universities
    });
});

// Get Single University Details
export const getUniversityDetails = wrapAsync(async (req, res) => {
    const { universityId } = req.params;

    const university = await University.findById(universityId)
        .select('-verificationToken -verificationTokenExpiry');

    if (!university) {
        throw new ExpressError(404, 'University not found');
    }

    res.json({
        success: true,
        data: {
            universityId: university._id,
            name: university.name,
            email: university.email,
            website: university.website,
            walletAddress: university.walletAddress,
            emailVerified: university.emailVerified,
            status: university.status,
            rejectionReason: university.rejectionReason,
            approvedAt: university.approvedAt,
            createdAt: university.createdAt,
            updatedAt: university.updatedAt,
            emailDomain: university.email.split('@')[1]
        }
    });
});

// Step 6a: Approve University
export const approveUniversity = wrapAsync(async (req, res) => {
    const { universityId } = req.params;

    const university = await University.findById(universityId);

    if (!university) {
        throw new ExpressError(404, 'University not found');
    }

    if (university.status === 'approved') {
        throw new ExpressError(400, 'University is already approved');
    }

    if (!university.emailVerified) {
        throw new ExpressError(400, 'University email is not verified');
    }

    if (!university.walletAddress) {
        throw new ExpressError(400, 'University wallet is not connected');
    }

    try {
        // Step 6: On-Chain Action - Approve issuer on blockchain
        const blockchainResult = {
            success: true,
            transactionHash: "0xMOCK_APPROVAL_TX"
        };

        if (!blockchainResult.success) {
            throw new ExpressError(500, `Blockchain approval failed: ${blockchainResult.error || 'Unknown error'}`);
        }

        // Step 6: Off-Chain Actions - Update database
        university.status = 'approved';
        university.approvedAt = new Date();
        university.rejectionReason = undefined; // Clear any previous rejection reason
        await university.save();

        // Step 6: Send approval email
        try {
            await sendApprovalEmail(university.email, university.name);
        } catch (emailError) {
            console.error('Failed to send approval email:', emailError);
            // Don't fail the approval if email fails
        }

        res.json({
            success: true,
            message: 'University approved successfully',
            data: {
                universityId: university._id,
                name: university.name,
                status: university.status,
                walletAddress: university.walletAddress,
                approvedAt: university.approvedAt,
                blockchainTransactionHash: blockchainResult.transactionHash || null
            }
        });

    } catch (error) {
        // If blockchain fails, rollback is not needed since we haven't updated DB yet
        // But if DB update succeeds but blockchain fails, we need to handle it
        // For now, we do blockchain first, then DB (safer)
        throw error;
    }
});

// Step 6b: Reject University
export const rejectUniversity = wrapAsync(async (req, res) => {
    const { universityId } = req.params;
    const { reason } = req.body; // Optional rejection reason

    const university = await University.findById(universityId);

    if (!university) {
        throw new ExpressError(404, 'University not found');
    }

    if (university.status === 'rejected') {
        throw new ExpressError(400, 'University is already rejected');
    }

    if (university.status === 'approved') {
        throw new ExpressError(400, 'Cannot reject an approved university');
    }

    // Update status
    university.status = 'rejected';
    university.rejectionReason = reason || 'Registration rejected by admin';
    await university.save();

    // Send rejection email
    try {
        await sendRejectionEmail(university.email, university.name, university.rejectionReason);
    } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
        // Don't fail the rejection if email fails
    }

    res.json({
        success: true,
        message: 'University rejected successfully',
        data: {
            universityId: university._id,
            name: university.name,
            status: university.status,
            rejectionReason: university.rejectionReason
        }
    });
});