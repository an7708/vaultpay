    import { Navigate } from 'react-router-dom';
    import useAuthStore from '../store/useAuthStore';

    export default function ProtectedRoute({ children, requiredRole }) {
    const { user } = useAuthStore();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
    }