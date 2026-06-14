    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    });

    const sendPaymentConfirmationEmail = async ({ to, clientName, invoiceNumber, total, pdfUrl }) => {
    const mailOptions = {
        from: `"Nexus Corporate Services" <${process.env.EMAIL_USER}>`,
        to,
        subject: `Payment Confirmed — Invoice ${invoiceNumber}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 32px; border-radius: 8px;">
            <div style="background: #1a1a2e; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Nexus Corporate Services</h1>
            <p style="color: #aaaaaa; margin: 8px 0 0;">Payment Confirmation</p>
            </div>
            <div style="background: #ffffff; padding: 32px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1a1a2e; margin-top: 0;">Payment Received</h2>
            <p style="color: #444444; line-height: 1.6;">Dear ${clientName},</p>
            <p style="color: #444444; line-height: 1.6;">
                We have successfully received your payment for Invoice <strong>${invoiceNumber}</strong>.
                Your transaction has been processed and your account is now up to date.
            </p>
            <div style="background: #f0fff4; border: 1px solid #00b894; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
                <p style="color: #00b894; font-size: 14px; margin: 0 0 8px; font-weight: bold;">AMOUNT PAID</p>
                <p style="color: #1a1a2e; font-size: 32px; font-weight: bold; margin: 0;">$${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                <p style="color: #666666; font-size: 12px; margin: 8px 0 0;">Invoice ${invoiceNumber}</p>
            </div>
            <p style="color: #444444; line-height: 1.6;">
                Your PDF receipt is ready for download:
            </p>
            <div style="text-align: center; margin: 24px 0;">
                <a href="${pdfUrl}" style="background: #1a1a2e; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                Download PDF Receipt
                </a>
            </div>
            <p style="color: #888888; font-size: 12px; line-height: 1.6; margin-top: 32px; padding-top: 16px; border-top: 1px solid #eeeeee;">
                This is an automated confirmation. Please do not reply to this email.<br>
                Nexus Corporate Services | 123 Financial District, New York, NY 10004
            </p>
            </div>
        </div>
        `,
    };

    await transporter.sendMail(mailOptions);
    };

    module.exports = sendPaymentConfirmationEmail;