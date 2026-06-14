    import { useState } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import api from '../../api/axios';
    import useAuthStore from '../../store/useAuthStore';

    export default function Register() {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [form, setForm] = useState({ name: '', email: '', password: '', company: '', role: 'client' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
        const res = await api.post('/auth/register', form);
        login(res.data.user, res.data.token);
        navigate(res.data.user.role === 'admin' ? '/admin' : '/client');
        } catch (err) {
        setError(err.response?.data?.message || 'Registration failed.');
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="auth-page">
        <div className="auth-card">
            <div className="auth-brand">
            <div className="brand-mark" />
            <span className="brand-name">VaultPay</span>
            </div>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join the Nexus Corporate billing portal</p>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="Your full name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
                <label className="form-label">Company</label>
                <input className="form-input" placeholder="Your company name" value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="you@company.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="Minimum 6 characters" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>
            <div className="form-group">
                <label className="form-label">Account Type</label>
                <select className="form-select" value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="client">Client</option>
                <option value="admin">Admin</option>
                </select>
            </div>
            <button className="btn-auth" type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
            </button>
            </form>

            <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign in</Link>
            </p>
        </div>
        </div>
    );
    }