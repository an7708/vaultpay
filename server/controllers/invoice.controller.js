    const Invoice = require('../models/Invoice.model');
    const User = require('../models/User.model');

    const generateInvoiceNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `NCS-${timestamp}-${random}`;
    };

    const getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find()
        .populate('client', 'name email company')
        .sort({ createdAt: -1 })
        .lean();
        res.status(200).json({ success: true, invoices });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
    };

    const getMyInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({ client: req.user._id })
        .sort({ createdAt: -1 })
        .lean();
        res.status(200).json({ success: true, invoices });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
    };

    const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
        .populate('client', 'name email company')
        .lean();

        if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found.' });
        }

        if (req.user.role !== 'admin' && invoice.client._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Access forbidden. This invoice does not belong to you.',
        });
        }

        res.status(200).json({ success: true, invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
    };

    const createInvoice = async (req, res) => {
    try {
        const { clientId, items, dueDate, notes, taxRate } = req.body;

        const client = await User.findById(clientId);
        if (!client || client.role !== 'client') {
        return res.status(404).json({ success: false, message: 'Client not found.' });
        }

        const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        const tax = taxRate ? parseFloat((subtotal * taxRate / 100).toFixed(2)) : 0;
        const total = parseFloat((subtotal + tax).toFixed(2));

        const invoice = await Invoice.create({
        invoiceNumber: generateInvoiceNumber(),
        client: clientId,
        clientEmail: client.email,
        clientName: client.name,
        items,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax,
        total,
        dueDate: new Date(dueDate),
        notes: notes || '',
        status: 'unpaid',
        });

        res.status(201).json({ success: true, invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
    };

    const getAdminStats = async (req, res) => {
    try {
        const [totalInvoices, paidInvoices, unpaidInvoices, clients] = await Promise.all([
        Invoice.countDocuments(),
        Invoice.find({ status: 'paid' }).lean(),
        Invoice.find({ status: 'unpaid' }).lean(),
        User.find({ role: 'client' }).select('name email company createdAt').lean(),
        ]);

        const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
        const outstanding = unpaidInvoices.reduce((sum, inv) => sum + inv.total, 0);

        res.status(200).json({
        success: true,
        stats: {
            totalInvoices,
            paidCount: paidInvoices.length,
            unpaidCount: unpaidInvoices.length,
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            outstanding: parseFloat(outstanding.toFixed(2)),
            totalClients: clients.length,
            clients,
        },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
    };

    module.exports = { getAllInvoices, getMyInvoices, getInvoiceById, createInvoice, getAdminStats };