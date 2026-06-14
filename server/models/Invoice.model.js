    const mongoose = require('mongoose');

    const invoiceSchema = new mongoose.Schema(
    {
        invoiceNumber: {
        type: String,
        unique: true,
        required: true,
        },
        client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        },
        clientEmail: {
        type: String,
        required: true,
        },
        clientName: {
        type: String,
        required: true,
        },
        items: [
        {
            description: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 },
            unitPrice: { type: Number, required: true, min: 0 },
        },
        ],
        subtotal: {
        type: Number,
        required: true,
        },
        tax: {
        type: Number,
        default: 0,
        },
        total: {
        type: Number,
        required: true,
        },
        status: {
        type: String,
        enum: ['unpaid', 'paid', 'overdue', 'cancelled'],
        default: 'unpaid',
        },
        dueDate: {
        type: Date,
        required: true,
        },
        paidAt: {
        type: Date,
        default: null,
        },
        stripeSessionId: {
        type: String,
        default: null,
        },
        pdfUrl: {
        type: String,
        default: null,
        },
        notes: {
        type: String,
        default: '',
        },
    },
    { timestamps: true }
    );

    module.exports = mongoose.model('Invoice', invoiceSchema);