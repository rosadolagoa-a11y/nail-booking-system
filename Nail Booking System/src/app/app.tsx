'use client';

import '@/index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/app/context/AuthContext';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { ClientLayout } from '@/app/components/ClientLayout';
import { DesignerLayout } from '@/app/components/DesignerLayout';
import ClientLogin from '@/app/pages/client/ClientLogin';
import ClientSignup from '@/app/pages/client/ClientSignup';
import DesignerLogin from '@/app/pages/designer/DesignerLogin';
import ServicesList from '@/app/pages/client/ServicesList';
import BookingFlow from '@/app/pages/client/BookingFlow';
import MyBookings from '@/app/pages/client/MyBookings';
import DesignerAgenda from '@/app/pages/designer/DesignerAgenda';
import DesignerServices from '@/app/pages/designer/DesignerServices';
import DesignerSchedule from '@/app/pages/designer/DesignerSchedule';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<ClientLogin />} />
          <Route path="/cadastro" element={<ClientSignup />} />
          <Route path="/designer/login" element={<DesignerLogin />} />

          <Route element={<ProtectedRoute role="client" />}>
            <Route element={<ClientLayout />}>
              <Route path="/" element={<ServicesList />} />
              <Route path="/reservar/:serviceId" element={<BookingFlow />} />
              <Route path="/minhas-reservas" element={<MyBookings />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute role="designer" />}>
            <Route element={<DesignerLayout />}>
              <Route path="/designer" element={<DesignerAgenda />} />
              <Route path="/designer/servicos" element={<DesignerServices />} />
              <Route path="/designer/expediente" element={<DesignerSchedule />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
