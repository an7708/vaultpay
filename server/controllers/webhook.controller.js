    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const Invoice = require('../models/Invoice.model');
    const generateInvoicePDF = require('../utils/generatePDF');
    const uploadPDFToCloud = require('../utils/uploadToCloud');
    const sendPaymentConfirmationEmail = require('../utils/sendEmail');

    const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ message: `Webhook Error: ${err.message}` });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { invoiceId, clientEmail, clientName } = session.metadata;

        try {
        const invoice = await Invoice.findByIdAndUpdate(
            invoiceId,
            {
            status: 'paid',
            paidAt: new Date(),
            stripeSessionId: session.id,
            },
            { new: true }
        );

        if (!invoice) {
            console.error('Invoice not found for webhook:', invoiceId);
            return res.status(200).json({ received: true });
        }

        console.log(`Invoice ${invoice.invoiceNumber} marked as PAID`);

        const pdfBuffer = await generateInvoicePDF(invoice);
        console.log('PDF generated successfully');

        const pdfUrl = await uploadPDFToCloud(
            pdfBuffer,
            `invoice-${invoice.invoiceNumber}-${Date.now()}`
        );
        console.log('PDF uploaded to Cloudinary:', pdfUrl);

        await Invoice.findByIdAndUpdate(invoiceId, { pdfUrl });

        await sendPaymentConfirmationEmail({
            to: clientEmail,
            clientName,
            invoiceNumber: invoice.invoiceNumber,
            total: invoice.total,
            pdfUrl,
        });
        console.log('Payment confirmation email sent to:', clientEmail);

        } catch (processingError) {
        console.error('Error processing webhook:', processingError.message);
        }
    }

    res.status(200).json({ received: true });
    };

    module.exports = { handleStripeWebhook };