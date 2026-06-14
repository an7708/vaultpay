    require('dotenv').config();
    const express = require('express');
    const mongoose = require('mongoose');
    const cors = require('cors');
    const rateLimit = require('express-rate-limit');

    const app = express();

    app.set('trust proxy', 1);

    app.use('/api/webhooks', require('./routes/webhook.routes'));

    
    app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://vaultpay-gamma.vercel.app',
    ].filter(Boolean),
    credentials: true,
}));

    app.use(express.json());

    const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { success: false, message: 'Too many requests. Please try again later.' },
    });
    app.use('/api', limiter);

    mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected — VaultPay'))
    .catch((err) => console.error('MongoDB error:', err.message));

    app.use('/api/auth', require('./routes/auth.routes'));
    app.use('/api/invoices', require('./routes/invoice.routes'));
    app.use('/api/payments', require('./routes/payment.routes'));

    app.get('/', (req, res) => {
    res.json({ message: 'VaultPay Financial Core API running' });
    });

    app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
    });

    app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal server error',
    });
    });

    const PORT = process.env.PORT || 5003;
    app.listen(PORT, () => {
    console.log(`VaultPay server running on port ${PORT}`);
    });