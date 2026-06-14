    const express = require('express');
    const router = express.Router();
    const { protect } = require('../middleware/auth.middleware');
    const { adminOnly } = require('../middleware/role.middleware');
    const {
    getAllInvoices,
    getMyInvoices,
    getInvoiceById,
    createInvoice,
    getAdminStats,
    } = require('../controllers/invoice.controller');

    router.get('/admin/all', protect, adminOnly, getAllInvoices);
    router.get('/admin/stats', protect, adminOnly, getAdminStats);
    router.post('/admin/create', protect, adminOnly, createInvoice);
    router.get('/my', protect, getMyInvoices);
    router.get('/:id', protect, getInvoiceById);

    module.exports = router;