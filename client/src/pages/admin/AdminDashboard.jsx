    import { useEffect, useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import api from '../../api/axios';
    import useAuthStore from '../../store/useAuthStore';

    export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [stats, setStats] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
        try {
            const [statsRes, invoicesRes] = await Promise.all([
            api.get('/invoices/admin/stats'),
            api.get('/invoices/admin/all'),
            ]);
            setStats(statsRes.data.stats);
            setInvoices(invoicesRes.data.invoices);
        } catch (err) {
            console.error('Failed to fetch admin data:', err.message);
        } finally {
            setLoading(false);
        }
        };
        fetchData();
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

    if (loading) return <div className="page-loading">Loading dashboard...</div>;

    return (
        <div className="dashboard-page">
        <nav className="dash-nav">
            <div className="nav-brand">
            <div className="brand-mark" />
            <span className="brand-name">VaultPay</span>
            <span className="role-badge admin-badge">Admin</span>
            </div>
            <div className="nav-right">
            <span className="nav-user">{user?.name}</span>
            <button className="btn-nav" onClick={() => navigate('/admin/create-invoice')}>
                New Invoice
            </button>
            <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
            </div>
        </nav>

        <div className="dash-content">
            <div className="dash-header">
            <h1 className="dash-title">Financial Overview</h1>
            <p className="dash-subtitle">Nexus Corporate Services — Billing Dashboard</p>
            </div>

            <div className="kpi-grid">
            <div className="kpi-card">
                <div className="kpi-label">Total Revenue</div>
                <div className="kpi-value green">${stats?.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="kpi-card">
                <div className="kpi-label">Outstanding</div>
                <div className="kpi-value red">${stats?.outstanding?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="kpi-card">
                <div className="kpi-label">Total Invoices</div>
                <div className="kpi-value blue">{stats?.totalInvoices}</div>
            </div>
            <div className="kpi-card">
                <div className="kpi-label">Total Clients</div>
                <div className="kpi-value gold">{stats?.totalClients}</div>
            </div>
            </div>

            <div className="section-header">
            <h2 className="section-title">All Invoices</h2>
            </div>

            <div className="table-card">
            <div className="table-head">
                <span>Invoice #</span>
                <span>Client</span>
                <span>Amount</span>
                <span>Status</span>
                <span>Due Date</span>
            </div>
            {invoices.length === 0 ? (
                <div className="table-empty">No invoices yet. Create your first invoice.</div>
            ) : (
                invoices.map((invoice) => (
                <div className="table-row" key={invoice._id}>
                    <span className="invoice-number">{invoice.invoiceNumber}</span>
                    <span className="invoice-client">{invoice.clientName}</span>
                    <span className="invoice-amount">${invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    <span className={`status-badge ${STATUS_CLASS[invoice.status]}`}>{invoice.status}</span>
                    <span className="invoice-date">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                </div>
                ))
            )}
            </div>
        </div>
        </div>
    );
    }