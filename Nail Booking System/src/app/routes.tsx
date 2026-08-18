import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { BookingFlow } from './pages/client/BookingFlow';

// Stubs para carregamento de páginas da interface
const LoginPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-background p-4">
    <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-sm">
      <h1 className="text-xl font-bold text-foreground">Login</h1>
      <p className="text-xs text-muted-foreground mt-1">Acesse sua conta para continuar.</p>
    </div>
  </div>
);

const ClientDashboard = () => (
  <div className="p-8 text-foreground">
    <h1 className="text-2xl font-bold">Painel do Cliente</h1>
  </div>
);

const DesignerDashboard = () => (
  <div className="p-8 text-foreground">
    <h1 className="text-2xl font-bold">Painel da Designer</h1>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/client',
    element: (
      <ProtectedRoute allowedRoles={['client']}>
        <ClientDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/client/book',
    element: (
      <ProtectedRoute allowedRoles={['client']}>
        <BookingFlow clientId={1} />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['designer']}>
        <DesignerDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
