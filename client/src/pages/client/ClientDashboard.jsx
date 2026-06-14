    import { useEffect, useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import api from '../../api/axios';
    import useAuthStore from '../../store/useAuthStore';

    export default function ClientDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoices = async () => {
        try {
            const res = await api.get('/invoices/my');
            setInvoices(res.data.invoices);
        } catch (err) {
            console.error('Failed to fetch invoices:', err.message);
        } finally {
            setLoading(false);
        }
        };
        fetchInvoices();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const STATUS_CLASS = {
        unpaid: 'status-unpaid',
        paid: 'status-paid',
        overdue: 'status-overdue',
        cancelled: 'status-cancelled',
    };

    const totalOutstanding = invoices
        .filter((inv) => inv.status === 'unpaid')
        .reduce((sum, inv) => sum + inv.total, 0);

    if (loading) return <div className="page-loading">Loading your invoices...</div>;

    return (
        <div className="dashboard-page">
        <nav className="dash-nav">
            <div className="nav-brand">
            <div className="brand-mark" />
            <span className="brand-name">VaultPay</span>
            <span className="role-badge client-badge">Client</span>
            </div>
            <div className="nav-right">
            <span className="nav-user">{user?.name}</span>
            <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
            </div>
        </nav>

        <div className="dash-content">
            <div className="dash-header">
            <div>
                <h1 className="dash-title">My Invoices</h1>
                <p className="dash-subtitle">{user?.company || 'Billing Portal'}</p>
            </div>
            {totalOutstanding > 0 && (
                <div className="outstanding-badge">
                Outstanding: ${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
            )}
            </div>

            {invoices.length === 0 ? (
            <div className="empty-state">
                <p>No invoices found. Your billing history will appear here.</p>
            </div>
            ) : (
            <div className="invoice-grid">
                {invoices.map((invoice) => (
                <div
                    key={invoice._id}
                    className={`invoice-card ${invoice.status === 'paid' ? 'invoice-card-paid' : ''}`}
                    onClick={() => navigate(`/client/invoices/${invoice._id}`)}>
                    <div className="invoice-card-header">
                    <span className="invoice-number">{invoice.invoiceNumber}</span>
                    <span className={`status-badge ${STATUS_CLASS[invoice.status]}`}>
                        {invoice.status}
                    </span>
                    </div>
                    <div className="invoice-card-amount">
                    ${invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="invoice-card-footer">
                    <span className="invoice-date">
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </span>
                    {invoice.status === 'unpaid' && (
                        <span className="pay-now-hint">Click to pay</span>
                    )}
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
        </div>
    );
    }