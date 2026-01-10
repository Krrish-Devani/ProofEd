import University from '../models/university.model.js';
import { ExpressError } from '../lib/ExpressError.js';
import { wrapAsync } from '../lib/wrapAsync.js';
import { generateOTP, sendOTPEmail } from '../lib/emailService.js';

// Step 1: University Signup (Initial Registration)
export const signup = wrapAsync(async (req, res) => {
    const { name, email, website } = req.body;

    // Check if university already exists
    const existingUniversity = await University.findOne({ 
        $or: [{ email: email.toLowerCase() }, { name }] 
    });

    if (existingUniversity) {
        throw new ExpressError(409, 'University with this email or name already exists');
    }

    // Generate 6-digit OTP and store as verificationToken
    const otp = generateOTP();
    const verificationTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create university with pending status
    const university = new University({
        name,
        email: email.toLowerCase(),
        website,
        verificationToken: otp, // Store OTP in verificationToken field
        verificationTokenExpiry,
        status: 'pending',
        emailVerified: false
    });

    await university.save();

    // Send OTP email
    try {
        await sendOTPEmail(email, otp);
    } catch (error) {
        console.error('Failed to send OTP email:', error);
        // Don't throw error - university is created, can resend OTP later
    }

    res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email for OTP verification.',
        data: {
            universityId: university._id,
            email: university.email,
            name: university.name,
            status: university.status
        }
    });
});

// Step 2a: Resend OTP
export const resendOTP = wrapAsync(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ExpressError(400, 'Email is required');
    }

    const university = await University.findOne({ email: email.toLowerCase() });

    if (!university) {
        throw new ExpressError(404, 'University not found');
    }

    if (university.emailVerified) {
        throw new ExpressError(400, 'Email already verified');
    }

    // Generate new OTP
    const otp = generateOTP();
    const verificationTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    university.verificationToken = otp; // Store OTP in verificationToken field
    university.verificationTokenExpiry = verificationTokenExpiry;
    await university.save();

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.json({
        success: true,
        message: 'OTP has been resent to your email'
    });
});

export const verifyEmail = wrapAsync(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ExpressError(400, 'Email and OTP are required');
    }

    const university = await University.findOne({ email: email.toLowerCase() });

    if (!university) {
        throw new ExpressError(404, 'University not found');
    }

    if (university.emailVerified) {
        throw new ExpressError(400, 'Email already verified');
    }

    // Check if verificationToken (OTP) exists and is valid
    if (!university.verificationToken || university.verificationToken !== otp) {
        throw new ExpressError(400, 'Invalid OTP');
    }

    // Check if OTP expired
    if (!university.verificationTokenExpiry || university.verificationTokenExpiry < new Date()) {
        throw new ExpressError(400, 'OTP has expired. Please request a new one.');
    }

    // Verify email - clear verificationToken
    university.emailVerified = true;
    university.verificationToken = undefined;
    university.verificationTokenExpiry = undefined;
    await university.save();

    res.json({
        success: true,
        message: 'Email verified successfully. Please connect your wallet to complete registration.',
        data: {
            universityId: university._id,
            email: university.email,
            emailVerified: university.emailVerified
        }
    });
});

// Step 3: Connect Wallet (Wallet Binding)
export const connectWallet = wrapAsync(async (req, res) => {
    const { email, walletAddress } = req.body;

    if (!email || !walletAddress) {
        throw new ExpressError(400, 'Email and wallet address are required');
    }

    const university = await University.findOne({ email: email.toLowerCase() });

    if (!university) {
        throw new ExpressError(404, 'University not found');
    }

    if (!university.emailVerified) {
        throw new ExpressError(400, 'Please verify your email first');
    }

    if (university.walletAddress) {
        throw new ExpressError(400, 'Wallet already connected. Cannot change wallet address.');
    }

    // Check if wallet is already used by another university
    const existingWallet = await University.findOne({ 
        walletAddress: walletAddress.toLowerCase() 
    });

    if (existingWallet) {
        throw new ExpressError(409, 'This wallet address is already registered');
    }

    // Link wallet to university
    university.walletAddress = walletAddress.toLowerCase();
    await university.save();

    res.json({
        success: true,
        message: 'Wallet connected successfully. Your request is under admin verification.',
        data: {
            universityId: university._id,
            walletAddress: university.walletAddress,
            status: university.status
        }
    });
});