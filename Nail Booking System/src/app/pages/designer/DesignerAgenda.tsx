import { useCallback, useEffect, useMemo, useState } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, DollarSign, Users } from 'lucide-react';
import loadBookingsByDateRange, { type BookingWithDetails } from '@/actions/loadBookingsByDateRange';
import updateBookingStatus from '@/actions/updateBookingStatus';
import { formatTimeLabel, toDateOnly } from '@/app/lib/timeUtils';
import { useAuth } from '@/app/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Booking = BookingWithDetails;

const statusVariants: Record<Booking['status'], 'default' | 'secondary' | 'destructive'> = {
  confirmed: 'default',
  cancelled: 'destructive',
  completed: 'secondary',
};

const statusLabels: Record<Booking['status'], string> = {
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Concluída',
};

type RangeMode = 'day' | 'week' | 'month';

export default function DesignerAgenda() {
  const { user } = useAuth();
  const [rangeMode, setRangeMode] = useState<RangeMode>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const rangeParams = useMemo(() => {
    if (rangeMode === 'week') {
      return {
        startDate: format(startOfWeek(selectedDate, { weekStartsOn: 0 }), 'yyyy-MM-dd'),
        endDate: format(endOfWeek(selectedDate, { weekStartsOn: 0 }), 'yyyy-MM-dd'),
      };
    }
    if (rangeMode === 'month') {
      return {
        startDate: format(startOfMonth(selectedDate), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(selectedDate), 'yyyy-MM-dd'),
      };
    }
    const day = format(selectedDate, 'yyyy-MM-dd');
    return { startDate: day, endDate: day };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeMode, selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadBookingsByDateRange(rangeParams);
      setBookings(data);
    } finally {
      setLoading(false);
    }
  }, [rangeParams]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const totalBookings = bookings.filter(b => b.status !== 'cancelled').length;
  const totalRevenue = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + Number(b.price), 0);

  const handleStatusChange = async (id: number, status: Booking['status']) => {
    if (!user?.id) return;
    await updateBookingStatus({ id: user.id, role: user.role }, { bookingId: id, status });
    await refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Agenda</h1>
          <p className="text-muted-foreground">Acompanhe suas reservas</p>
        </div>
        <Tabs value={rangeMode} onValueChange={value => setRangeMode(value as RangeMode)}>
          <TabsList>
            <TabsTrigger value="day">Dia</TabsTrigger>
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="month">Mês</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total de reservas</p>
              <p className="text-xl font-semibold">{totalBookings}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <DollarSign className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Faturamento estimado</p>
              <p className="text-xl font-semibold">R$ {totalRevenue.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <Card className="w-fit">
          <CardContent className="p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={date => date && setSelectedDate(date)}
              className="rounded-md"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4" /> Reservas do período
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando…</p>
            ) : bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma reserva neste período.</p>
            ) : (
              bookings.map(booking => (
                <div
                  key={booking.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{booking.client_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.service_name} •{' '}
                      {format(toDateOnly(booking.booking_date), "dd/MM", { locale: ptBR })} às{' '}
                      {formatTimeLabel(booking.start_time)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariants[booking.status]}>{statusLabels[booking.status]}</Badge>
                    {booking.status === 'confirmed' ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(booking.id, 'completed')}
                        >
                          Concluir
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusChange(booking.id, 'cancelled')}
                        >
                          Cancelar
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
