    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const Invoice = require('../models/Invoice.model');

    const createCheckoutSession = async (req, res) => {
    try {
        const { invoiceId } = req.body;

        const invoice = await Invoice.findById(invoiceId);

        if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found.' });
        }

        if (invoice.client.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access forbidden.' });
        }

        if (invoice.status === 'paid') {
        return res.status(400).json({ success: false, message: 'This invoice has already been paid.' });
        }

        const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: invoice.items.map((item) => ({
            price_data: {
            currency: 'usd',
            product_data: {
                name: item.description,
            },
            unit_amount: Math.round(item.unitPrice * 100),
            },
            quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/client/invoices/${invoiceId}?payment=success`,
        cancel_url: `${process.env.CLIENT_URL}/client/invoices/${invoiceId}?payment=cancelled`,
        metadata: {
            invoiceId: invoiceId.toString(),
            clientEmail: invoice.clientEmail,
            clientName: invoice.clientName,
        },
        });

        await Invoice.findByIdAndUpdate(invoiceId, { stripeSessionId: session.id });

        res.status(200).json({ success: true, url: session.url });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
    };

    module.exports = { createCheckoutSession };