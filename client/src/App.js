import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateInvoice from './pages/admin/CreateInvoice';
import ClientDashboard from './pages/client/ClientDashboard';
import InvoiceDetail from './pages/client/InvoiceDetail';
import Unauthorized from './pages/Unauthorized';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/create-invoice" element={
          <ProtectedRoute requiredRole="admin">
            <CreateInvoice />
          </ProtectedRoute>
        } />

        <Route path="/client" element={
          <ProtectedRoute requiredRole="client">
            <ClientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/client/invoices/:id" element={
          <ProtectedRoute requiredRole="client">
            <InvoiceDetail />
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/unauthorized" replace />} />
      </Routes>
    </BrowserRouter>
  );
}