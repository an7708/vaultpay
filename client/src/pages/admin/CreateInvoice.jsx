    import { useState, useEffect } from 'react';
    import { useNavigate } from 'react-router-dom';
    import api from '../../api/axios';

    export default function CreateInvoice() {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [form, setForm] = useState({
        clientId: '',
        dueDate: '',
        notes: '',
        taxRate: 0,
        items: [{ description: '', quantity: 1, unitPrice: 0 }],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchClients = async () => {
        try {
            const res = await api.get('/invoices/admin/stats');
            setClients(res.data.stats.clients);
        } catch (err) {
            console.error('Failed to fetch clients:', err.message);
        }
        };
        fetchClients();
    }, []);

    const addItem = () => {
        setForm({ ...form, items: [...form.items, { description: '', quantity: 1, unitPrice: 0 }] });
    };

    const removeItem = (index) => {
        setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
    };

    const updateItem = (index, field, value) => {
        const updatedItems = form.items.map((item, i) =>
        i === index ? { ...item, [field]: field === 'description' ? value : Number(value) } : item
        );
        setForm({ ...form, items: updatedItems });
    };

    const subtotal = form.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = subtotal * (form.taxRate / 100);
    const total = subtotal + tax;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
        await api.post('/invoices/admin/create', form);
        navigate('/admin');
        } catch (err) {
        setError(err.response?.data?.message || 'Failed to create invoice.');
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="create-page">
        <div className="create-container">
            <div className="create-header">
            <button className="btn-back" onClick={() => navigate('/admin')}>Back to Dashboard</button>
            <h1 className="create-title">Create New Invoice</h1>
            </div>

            {error && <div className="form-error">{error}</div>}

            <form className="create-form" onSubmit={handleSubmit}>
            <div className="form-section">
                <h2 className="form-section-title">Invoice Details</h2>
                <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Client</label>
                    <select className="form-select" value={form.clientId}
                    onChange={(e) => setForm({ ...form, clientId: e.target.value })} required>
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                        <option key={client._id} value={client._id}>
                        {client.name} — {client.company || client.email}
                        </option>
                    ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input className="form-input" type="date" value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
                </div>
                </div>
                <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Tax Rate (%)</label>
                    <input className="form-input" type="number" min="0" max="100" value={form.taxRate}
                    onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                    <label className="form-label">Notes (Optional)</label>
                    <input className="form-input" placeholder="Payment terms, notes..." value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
                </div>
            </div>

            <div className="form-section">
                <div className="section-row">
                <h2 className="form-section-title">Line Items</h2>
                <button type="button" className="btn-add-item" onClick={addItem}>Add Item</button>
                </div>

                <div className="items-header">
                <span>Description</span>
                <span>Qty</span>
                <span>Unit Price ($)</span>
                <span>Total</span>
                <span></span>
                </div>

                {form.items.map((item, index) => (
                <div key={index} className="item-row">
                    <input className="form-input" placeholder="Service description" value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)} required />
                    <input className="form-input" type="number" min="1" value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)} required />
                    <input className="form-input" type="number" min="0" step="0.01" value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', e.target.value)} required />
                    <span className="item-total">
                    ${(item.quantity * item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    {form.items.length > 1 && (
                    <button type="button" className="btn-remove" onClick={() => removeItem(index)}>Remove</button>
                    )}
                </div>
                ))}

                <div className="invoice-totals">
                <div className="total-row">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="total-row">
                    <span>Tax ({form.taxRate}%)</span>
                    <span>${tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="total-row total-final">
                    <span>Total Due</span>
                    <span>${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                </div>
            </div>

            <div className="form-actions">
                <button type="button" className="btn-ghost" onClick={() => navigate('/admin')}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Invoice'}
                </button>
            </div>
            </form>
        </div>
        </div>
    );
    }