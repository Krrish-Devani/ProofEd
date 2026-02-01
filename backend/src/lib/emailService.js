import nodemailer from 'nodemailer';
import crypto from 'crypto';

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '465'),
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        // Add connection timeout settings to prevent hanging
        connectionTimeout: 15000, // 15 seconds
        greetingTimeout: 15000,
        socketTimeout: 15000,
        // Pool settings for better connection handling
        pool: true,
        maxConnections: 1,
        maxMessages: 3,
    });
};

export const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: email,
            subject: 'ProofEd - Email Verification OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Email Verification</h2>
                    <p>Thank you for registering with ProofEd. Please use the following OTP to verify your email:</p>
                    <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #333; letter-spacing: 5px; margin: 0;">${otp}</h1>
                    </div>
                    <p>This OTP is valid for 10 minutes.</p>
                    <p>If you did not request this, please ignore this email.</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('OTP Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send verification email');
    }
};

// Send university approval email
export const sendApprovalEmail = async (email, universityName) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: email,
            subject: 'ProofEd - University Approved',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Congratulations!</h2>
                    <p>Your university registration has been approved.</p>
                    <p><strong>University Name:</strong> ${universityName}</p>
                    <p>You can now log in to your dashboard and start issuing certificates.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL}/university/login" 
                           style="background-color: #28a745; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Login to Dashboard
                        </a>
                    </div>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Approval email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending approval email:', error);
        throw new Error('Failed to send approval email');
    }
};

// Send university rejection email
export const sendRejectionEmail = async (email, universityName, reason) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: email,
            subject: 'ProofEd - University Registration Status',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Registration Update</h2>
                    <p>We regret to inform you that your university registration has not been approved.</p>
                    <p><strong>University Name:</strong> ${universityName}</p>
                    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                    <p>If you believe this is an error, please contact our support team.</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Rejection email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending rejection email:', error);
        throw new Error('Failed to send rejection email');
    }
};