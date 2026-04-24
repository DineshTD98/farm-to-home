const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * sendWelcomeEmail - Sent when a new user signs up
 */
const sendWelcomeEmail = async (user) => {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: user.email,
            subject: 'Welcome to Farm2Home! 🌾',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 20px;">
                    <h2 style="color: #16a34a; text-transform: uppercase; letter-spacing: 2px;">Farm2Home</h2>
                    <h1 style="color: #111827; margin-top: 20px;">Welcome aboard, ${user.firstName}!</h1>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Thank you for joining Farm2Home. We're excited to help you connect directly with local farmers and discover the freshest produce in your community.
                    </p>
                    <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 12px;">
                        <p style="margin: 0; color: #6b7280; font-size: 14px;">Your account is active as a <strong>${user.role}</strong>.</p>
                    </div>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="display: inline-block; background-color: #fbbc05; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 900; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Start Exploring</a>
                    <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 30px 0;">
                    <p style="color: #9ca3af; font-size: 12px; text-align: center;">🌾 Farm2Home • Supporting Local Farmers</p>
                </div>
            `
        });
        if (error) console.error('[EmailService] Welcome Email Error:', error);
        return { data, error };
    } catch (err) {
        console.error('[EmailService] Welcome Email failed:', err);
    }
};

/**
 * sendOTPEmail - Sent for forgot password
 */
const sendOTPEmail = async (user, otp) => {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: user.email,
            subject: `${otp} is your Farm2Home Verification Code`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e5e7eb; border-radius: 30px; text-align: center;">
                    <h2 style="color: #16a34a; margin-bottom: 30px; letter-spacing: 2px;">Farm2Home</h2>
                    <p style="color: #4b5563; font-size: 16px;">Hi ${user.firstName}, use the code below to reset your password. It will expire in 10 minutes.</p>
                    <div style="margin: 40px 0; background: #f3f4f6; padding: 30px; border-radius: 20px;">
                        <span style="font-size: 48px; font-weight: 900; letter-spacing: 10px; color: #111827;">${otp}</span>
                    </div>
                    <p style="color: #9ca3af; font-size: 12px;">If you didn't request this code, you can safely ignore this email.</p>
                </div>
            `
        });
        if (error) console.error('[EmailService] OTP Email Error:', error);
        return { data, error };
    } catch (err) {
        console.error('[EmailService] OTP Email failed:', err);
    }
};

/**
 * sendOrderConfirmationEmail - Sent to the buyer
 */
const sendOrderConfirmationEmail = async (buyer, order) => {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: buyer.email,
            subject: `Order Confirmed: #${order._id.toString().slice(-6).toUpperCase()}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 20px;">
                    <h2 style="color: #16a34a; letter-spacing: 2px;">Farm2Home</h2>
                    <h1 style="color: #111827;">Order Confirmed!</h1>
                    <p style="color: #4b5563;">Hi ${buyer.firstName}, your fresh harvest is on its way!</p>
                    <div style="margin: 30px 0; padding: 20px; border: 2px dashed #fbbc05; border-radius: 12px;">
                        <h3 style="margin-top: 0;">Order Summary</h3>
                        <p style="margin: 5px 0;">Total Amount: <strong>Rs ${order.totalAmount}</strong></p>
                        <p style="margin: 5px 0;">Delivery to: <strong>${order.deliveryAddress}</strong></p>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">Track your order progress in your buyer portal.</p>
                </div>
            `
        });
        if (error) console.error('[EmailService] Confirmation Email Error:', error);
        return { data, error };
    } catch (err) {
        console.error('[EmailService] Order Confirmation Email failed:', err);
    }
};

/**
 * sendNewOrderAlertEmail - Sent to the farmer
 */
const sendNewOrderAlertEmail = async (farmer, order) => {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: farmer.email,
            subject: 'New Order Received! 🚜',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 20px;">
                    <h2 style="color: #16a34a; letter-spacing: 2px;">Farm2Home</h2>
                    <h1 style="color: #111827;">You have a new order!</h1>
                    <p style="color: #4b5563;">Hi ${farmer.firstName}, a new customer has just purchased from your farm.</p>
                    <div style="margin: 30px 0; padding: 20px; background-color: #f0fdf4; border-radius: 12px;">
                        <p style="margin: 0; color: #166534; font-weight: bold;">Check your farmer portal to manage and ship this order.</p>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">Order ID: #${order._id.toString().slice(-6).toUpperCase()}</p>
                </div>
            `
        });
        if (error) console.error('[EmailService] Farmer Alert Email Error:', error);
        return { data, error };
    } catch (err) {
        console.error('[EmailService] Farmer Alert Email failed:', err);
    }
};

module.exports = {
    sendWelcomeEmail,
    sendOTPEmail,
    sendOrderConfirmationEmail,
    sendNewOrderAlertEmail
};
