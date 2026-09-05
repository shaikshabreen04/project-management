import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export async function sendResetEmail(email, resetToken) {

    const resetLink =
        `http://localhost:5000/users/reset-password/${resetToken}`;

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Password Reset Request',
        html: `
            <h2>Password Reset</h2>

            <p>You requested to reset your password.</p>

            <p>Use the following link to reset your password:</p>

            <a href="${resetLink}">
                Reset Password
            </a>

            <p>This link will expire soon.</p>
        `
    });
}