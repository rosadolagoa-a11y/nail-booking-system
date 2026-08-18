import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/app/components/AppHeader';

export function ClientLayout() {
  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader
        navItems={[
          { to: '/', label: 'Serviços' },
          { to: '/minhas-reservas', label: 'Minhas Reservas' },
        ]}
      />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
