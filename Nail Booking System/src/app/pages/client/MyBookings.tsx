import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarX2 } from 'lucide-react';
import { useLoadAction, useMutateAction } from '@uibakery/data';
import loadMyBookings from '@/actions/loadMyBookings';
import updateBookingStatus from '@/actions/updateBookingStatus';
import { formatTimeLabel, toDateOnly } from '@/app/lib/timeUtils';
import { useAuth } from '@/app/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

type Booking = {
  id: number;
  service_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  service_name: string;
  duration_minutes: number;
  price: string;
};

const statusLabels: Record<Booking['status'], string> = {
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Concluída',
};

const statusVariants: Record<Booking['status'], 'default' | 'secondary' | 'destructive'> = {
  confirmed: 'default',
  cancelled: 'destructive',
  completed: 'secondary',
};

export default function MyBookings() {
  const { user } = useAuth();
  const myBookingsParams = useMemo(() => ({ clientId: user?.id }), [user?.id]);
  const [bookings, loading, , refresh]: [Booking[], boolean, Error | null, () => Promise<void>] = useLoadAction(
    loadMyBookings,
    [],
    myBookingsParams,
    { enabled: Boolean(user?.id) },
  );
  const [runCancel, cancelling] = useMutateAction(updateBookingStatus);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');
  const upcoming = bookings.filter(b => b.status === 'confirmed' && b.booking_date.slice(0, 10) >= today);
  const history = bookings.filter(b => b.status !== 'confirmed' || b.booking_date.slice(0, 10) < today);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    await runCancel({ id: cancelTarget.id, status: 'cancelled' });
    setCancelTarget(null);
    await refresh();
  };

  const renderBooking = (booking: Booking, canCancel: boolean) => (
    <Card key={booking.id}>
      <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div>
          <p className="font-medium">{booking.service_name}</p>
          <p className="text-sm text-muted-foreground">
            {format(toDateOnly(booking.booking_date), "dd 'de' MMMM", { locale: ptBR })} às{' '}
            {formatTimeLabel(booking.start_time)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusVariants[booking.status]}>{statusLabels[booking.status]}</Badge>
          {canCancel ? (
            <Button variant="outline" size="sm" onClick={() => setCancelTarget(booking)}>
              Cancelar
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Minhas Reservas</h1>
        <p className="text-muted-foreground">Acompanhe seus agendamentos</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Próximos agendamentos</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : upcoming.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <CalendarX2 className="h-8 w-8" />
              <p>Você não tem reservas futuras.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">{upcoming.map(b => renderBooking(b, true))}</div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Histórico</h2>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum histórico ainda.</p>
        ) : (
          <div className="space-y-3">{history.map(b => renderBooking(b, false))}</div>
        )}
      </section>

      <Dialog open={Boolean(cancelTarget)} onOpenChange={open => !open && setCancelTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar reserva</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar a reserva de {cancelTarget?.service_name}? Esta ação libera o horário
              para outras clientes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              Voltar
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? 'Cancelando…' : 'Confirmar cancelamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
