import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/userModel.js';
import nodemailer from 'nodemailer';


// =====================================================
// CREATE EMAIL TRANSPORTER
// =====================================================

function createTransporter() {

    return nodemailer.createTransport({

        host: process.env.SMTP_HOST || 'smtp.gmail.com',

        port: Number(process.env.SMTP_PORT) || 587,

        secure: false,

        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }

    });
}


// =====================================================
// CREATE USER
// =====================================================

export async function createUser(userData) {

    const user = await User.create(userData);

    return user;
}


// =====================================================
// GET ALL USERS
// =====================================================

export async function getAllUsers() {

    const users = await User.find();

    return users;
}


// =====================================================
// GET USER BY ID
// =====================================================

export async function getUserById(id) {

    const user = await User.findById(id);

    return user;
}


// =====================================================
// UPDATE USER
// =====================================================

export async function updateUser(id, userData) {

    const user = await User.findByIdAndUpdate(
        id,
        userData,
        {
            new: true,
            runValidators: true
        }
    );

    return user;
}


// =====================================================
// DELETE USER
// =====================================================

export async function deleteUser(id) {

    const user = await User.findByIdAndDelete(id);

    return user;
}


// =====================================================
// SIGN UP
// =====================================================

export async function signUp(userData) {

    const {
        userId,
        name,
        email,
        password,
        role,
        experience
    } = userData;


    // Check whether email already exists

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error('User already exists');
    }


    // Hash password

    const hashedPassword = await bcrypt.hash(
        password,
        10
    );


    // Create user

    const user = await User.create({

        userId,
        name,
        email,
        password: hashedPassword,
        role,
        experience

    });


    return user;
}


// =====================================================
// SIGN IN
// =====================================================

export async function signIn(email, password) {

    // Find user

    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Invalid email or password');
    }


    // Compare password

    const isMatch = await bcrypt.compare(
        password,
        user.password
    );


    if (!isMatch) {
        throw new Error('Invalid email or password');
    }


    // Create JWT

    const token = jwt.sign(

        {
            userId: user._id
        },

        process.env.SECRET_KEY,

        {
            expiresIn: '24h'
        }

    );


    return {
        user,
        token
    };
}


// =====================================================
// FORGOT PASSWORD - RESET LINK
// =====================================================

export async function forgotPassword(email) {

    // Find user using email

    const user = await User.findOne({ email });

    if (!user) {
        throw new Error(
            'User with this email does not exist'
        );
    }


    // Create reset token

    const resetToken = jwt.sign(

        {
            userId: user._id
        },

        process.env.RESET_PASSWORD_SECRET,

        {
            expiresIn: '24h'
        }

    );


    // Reset link

    const resetLink =
        `http://localhost:${process.env.PORT || 5000}/users/reset-password?token=${resetToken}`;


    // Create transporter AFTER environment variables are loaded

    const transporter = createTransporter();


    // Send email

    await transporter.sendMail({

        from: process.env.SMTP_USER,

        to: user.email,

        subject: 'Password Reset Request',

        text:
`Hello ${user.name},

You requested to reset your password.

Use the following reset token:

${resetToken}

Reset Password API:

POST ${resetLink}

This reset token will expire in 24 hours.

If you did not request this password reset, please ignore this email.`

    });


    return {
        message: 'Password reset email sent successfully'
    };
}


// =====================================================
// RESET PASSWORD - RESET LINK
// =====================================================

export async function resetPassword(
    token,
    newPassword
) {

    let decoded;


    try {

        // Verify reset token

        decoded = jwt.verify(
            token,
            process.env.RESET_PASSWORD_SECRET
        );

    } catch (err) {

        throw new Error(
            'Invalid or expired password reset token'
        );
    }


    // Find user

    const user = await User.findById(
        decoded.userId
    );

    if (!user) {
        throw new Error('User not found');
    }


    // Hash new password

    const hashedPassword = await bcrypt.hash(
        newPassword,
        10
    );


    // Update password

    user.password = hashedPassword;

    await user.save();


    return {
        message: 'Password reset successfully'
    };
}


// =====================================================
// FORGOT PASSWORD - OTP
// =====================================================

export async function forgotPasswordOtp(email) {

    // Find user using email

    const user = await User.findOne({ email });

    if (!user) {
        throw new Error(
            'User with this email does not exist'
        );
    }


    // Generate 6-digit OTP

    const otp = crypto
        .randomInt(100000, 1000000)
        .toString();


    // OTP expires after 10 minutes

    const otpExpires = new Date(
        Date.now() + 10 * 60 * 1000
    );


    // Save OTP in database

    user.resetOtp = otp;

    user.resetOtpExpires = otpExpires;

    await user.save();


    // Create transporter AFTER environment variables are loaded

    const transporter = createTransporter();


    // Send OTP email

    await transporter.sendMail({

        from: process.env.SMTP_USER,

        to: user.email,

        subject: 'Password Reset OTP',

        text:
`Hello ${user.name},

Your password reset OTP is:

${otp}

This OTP will expire in 10 minutes.

If you did not request a password reset, please ignore this email.`

    });


    return {
        message: 'Password reset OTP sent successfully'
    };
}


// =====================================================
// RESET PASSWORD - OTP
// =====================================================

export async function resetPasswordOtp(
    email,
    otp,
    newPassword
) {

    // Find user

    const user = await User.findOne({ email });

    if (!user) {
        throw new Error(
            'User with this email does not exist'
        );
    }


    // Check whether OTP exists

    if (!user.resetOtp) {
        throw new Error(
            'OTP not found. Please request a new OTP'
        );
    }


    // Check OTP

    if (user.resetOtp !== otp) {
        throw new Error('Invalid OTP');
    }


    // Check OTP expiry

    if (
        !user.resetOtpExpires ||
        user.resetOtpExpires < new Date()
    ) {
        throw new Error('OTP has expired');
    }


    // Hash new password

    const hashedPassword = await bcrypt.hash(
        newPassword,
        10
    );


    // Update password

    user.password = hashedPassword;


    // Clear OTP after successful reset

    user.resetOtp = null;

    user.resetOtpExpires = null;


    // Save user

    await user.save();


    return {
        message: 'Password reset successfully using OTP'
    };
}