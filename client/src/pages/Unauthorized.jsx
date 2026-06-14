    import { useNavigate } from 'react-router-dom';
    import useAuthStore from '../store/useAuthStore';

    export default function Unauthorized() {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    return (
        <div className="unauth-page">
        <div className="unauth-card">
            <div className="unauth-code">403</div>
            <h1 className="unauth-title">Access Forbidden</h1>
            <p className="unauth-message">
            You do not have permission to view this page.
            This incident has been logged.
            </p>
            <button
            className="btn-primary"
            onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/client')}>
            Return to Dashboard
            </button>
        </div>
        </div>
    );
    }