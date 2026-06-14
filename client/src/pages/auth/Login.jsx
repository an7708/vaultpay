    import { useState } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import api from '../../api/axios';
    import useAuthStore from '../../store/useAuthStore';

    export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
        const res = await api.post('/auth/login', form);
        login(res.data.user, res.data.token);
        navigate(res.data.user.role === 'admin' ? '/admin' : '/client');
        } catch (err) {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
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
            <h1 className="auth-title">Sign In</h1>
            <p className="auth-subtitle">Access the Nexus Corporate billing portal</p>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                className="form-input"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                />
            </div>
            <div className="form-group">
                <label className="form-label">Password</label>
                <input
                className="form-input"
                type="password"
                placeholder="Your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                />
            </div>
            <button className="btn-auth" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
            </button>
            </form>

            <p className="auth-switch">
            No account?{' '}
            <Link to="/register" className="auth-link">Create one</Link>
            </p>
        </div>
        </div>
    );
    }