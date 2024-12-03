import nodemailer from 'nodemailer';

// Configure nodemailer; uses our email account and app password to send emails, it authenticates us as the sender
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendPasswordResetEmail = async (email, resetToken) => {
    // Use environment variable for frontend URL, fallback to localhost for development
    const frontendUrl = process.env.NODE_ENV === 'production' 
        ? 'https://rootapp.netlify.app'
        : 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/api/users/reset-password/${resetToken}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        html: `
            <h1>Password Reset Request</h1>
            <p>You requested a password reset from the Root App. Click the link below to reset your password:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>This link will expire in 30 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `
    };

    await transporter.sendMail(mailOptions); // Send the email 
};
