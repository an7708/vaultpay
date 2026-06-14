    import { useEffect, useState } from 'react';
    import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
    import api from '../../api/axios';

    export default function InvoiceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (searchParams.get('payment') === 'success') {
        setMessage('Payment successful! Your receipt has been emailed to you.');
        }
        if (searchParams.get('payment') === 'cancelled') {
        setMessage('Payment was cancelled. No charges were made.');
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchInvoice = async () => {
        try {
            const res = await api.get(`/invoices/${id}`);
            setInvoice(res.data.invoice);
        } catch (err) {
            if (err.response?.status === 403) {
            navigate('/unauthorized');
            } else {
            navigate('/client');
            }
        } finally {
            setLoading(false);
        }
        };
        fetchInvoice();
    }, [id, navigate]);

    const handlePay = async () => {
        if (paying) return;
        setPaying(true);
        try {
        const res = await api.post('/payments/create-checkout-session', { invoiceId: id });
        window.location.href = res.data.url;
        } catch (err) {
        setMessage(err.response?.data?.message || 'Payment failed. Please try again.');
        setPaying(false);
        }
    };

    const handleDownloadPDF = () => {
        if (invoice?.pdfUrl) {
        window.open(invoice.pdfUrl, '_blank');
        }
    };

    if (loading) return <div className="page-loading">Loading invoice...</div>;
    if (!invoice) return null;

    return (
        <div className="detail-page">
        <div className="detail-container">
            <div className="detail-nav">
            <button className="btn-back" onClick={() => navigate('/client')}>
                Back to Invoices
            </button>
            <div className="detail-actions">
                {invoice.pdfUrl && (
                <button className="btn-ghost" onClick={handleDownloadPDF}>
                    Download PDF
                </button>
                )}
                {invoice.status === 'unpaid' && (
                <button
                    className="btn-pay"
                    onClick={handlePay}
                    disabled={paying}>
                    {paying ? 'Redirecting to Stripe...' : `Pay $${invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                </button>
                )}
            </div>
            </div>

            {message && (
            <div className={`message-banner ${searchParams.get('payment') === 'success' ? 'message-success' : 'message-info'}`}>
                {message}
            </div>
            )}

            <div className="invoice-document">
            <div className="invoice-doc-header">
                <div>
                <h1 className="company-name">NEXUS CORPORATE SERVICES</h1>
                <p className="company-address">123 Financial District, New York, NY 10004</p>
                </div>
                <div className="invoice-status-large">
                <div className={`status-stamp ${invoice.status === 'paid' ? 'stamp-paid' : 'stamp-unpaid'}`}>
                    {invoice.status.toUpperCase()}
                </div>
                </div>
            </div>

            <div className="invoice-meta">
                <div>
                <p className="meta-label">Invoice Number</p>
                <p className="meta-value">{invoice.invoiceNumber}</p>
                </div>
                <div>
                <p className="meta-label">Issue Date</p>
                <p className="meta-value">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                <p className="meta-label">Due Date</p>
                <p className="meta-value">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                <p className="meta-label">Billed To</p>
                <p className="meta-value">{invoice.clientName}</p>
                <p className="meta-sub">{invoice.clientEmail}</p>
                </div>
            </div>

            <table className="line-items-table">
                <thead>
                <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
                </thead>
                <tbody>
                {invoice.items.map((item, i) => (
                    <tr key={i}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>${item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td>${(item.quantity * item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <div className="invoice-totals-section">
                <div className="totals-block">
                <div className="total-line">
                    <span>Subtotal</span>
                    <span>${invoice.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="total-line">
                    <span>Tax</span>
                    <span>${invoice.tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="total-line total-final">
                    <span>Total Due</span>
                    <span>${invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                </div>
            </div>

            {invoice.notes && (
                <div className="invoice-notes">
                <p className="notes-label">Notes</p>
                <p className="notes-text">{invoice.notes}</p>
                </div>
            )}
            </div>
        </div>
        </div>
    );
    }