import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/app/components/AppHeader';

export function DesignerLayout() {
  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader
        navItems={[
          { to: '/designer', label: 'Agenda' },
          { to: '/designer/servicos', label: 'Serviços' },
          { to: '/designer/expediente', label: 'Expediente' },
        ]}
      />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
