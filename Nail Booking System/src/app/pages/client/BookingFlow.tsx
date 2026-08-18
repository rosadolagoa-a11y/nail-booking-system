import { useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useLoadAction, useMutateAction } from '@uibakery/data';
import loadActiveServices from '@/actions/loadActiveServices';
import loadWorkingHours from '@/actions/loadWorkingHours';
import loadBlockedDates from '@/actions/loadBlockedDates';
import loadBookingsForDate from '@/actions/loadBookingsForDate';
import createBooking from '@/actions/createBooking';
import { getAvailableSlots, formatTimeLabel, addMinutesToTime } from '@/app/lib/timeUtils';
import { EMPTY_PARAMS } from '@/app/lib/constants';
import { useAuth } from '@/app/context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

type Service = { id: number; name: string; duration_minutes: number; price: string };
type WorkingHourRow = { day_of_week: number; start_time: string | null; end_time: string | null; is_closed: boolean };
type BlockedDateRow = { blocked_date: string };
type ExistingBookingRow = { start_time: string; end_time: string };

export default function BookingFlow() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [services]: [Service[], boolean, Error | null, () => Promise<void>] = useLoadAction(loadActiveServices, [], EMPTY_PARAMS);
  const [workingHours]: [WorkingHourRow[], boolean, Error | null, () => Promise<void>] = useLoadAction(loadWorkingHours, [], EMPTY_PARAMS);
  const [blockedDates]: [BlockedDateRow[], boolean, Error | null, () => Promise<void>] = useLoadAction(loadBlockedDates, [], EMPTY_PARAMS);

  const dateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  const dayBookingsParams = useMemo(() => ({ bookingDate: dateKey }), [dateKey]);

  const [dayBookings, dayBookingsLoading]: [ExistingBookingRow[], boolean, Error | null, () => Promise<void>] = useLoadAction(
    loadBookingsForDate,
    [],
    dayBookingsParams,
    { enabled: Boolean(dateKey) },
  );

  const [runCreateBooking, submitting] = useMutateAction(createBooking);

  const service = services.find(s => String(s.id) === serviceId);

  const isBlocked = useMemo(
    () => blockedDates.some(b => b.blocked_date.slice(0, 10) === dateKey),
    [blockedDates, dateKey],
  );

  const workingHourForDay = useMemo(() => {
    if (!selectedDate) return undefined;
    return workingHours.find(w => w.day_of_week === selectedDate.getDay());
  }, [workingHours, selectedDate]);

  const availableSlots = useMemo(() => {
    if (!selectedDate || !service || isBlocked) return [];
    return getAvailableSlots(workingHourForDay, service.duration_minutes, dayBookings);
  }, [selectedDate, service, isBlocked, workingHourForDay, dayBookings]);

  if (!service) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Serviço não encontrado.</p>
        <Button variant="outline" onClick={() => navigate('/')}>
          Voltar para serviços
        </Button>
      </div>
    );
  }

  const handleConfirm = async () => {
    if (!selectedSlot || !user || !selectedDate) return;
    setSubmitError('');
    try {
      await runCreateBooking({
        clientId: user.id,
        serviceId: service.id,
        bookingDate: dateKey,
        startTime: selectedSlot,
        endTime: addMinutesToTime(selectedSlot, service.duration_minutes),
      });
      setConfirmed(true);
    } catch {
      setSubmitError('Não foi possível confirmar a reserva. O horário pode ter sido ocupado, tente novamente.');
    }
  };

  if (confirmed) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <CheckCircle2 className="h-14 w-14 text-green-600" />
          <h2 className="text-xl font-semibold">Reserva confirmada!</h2>
          <p className="text-muted-foreground">
            {service.name} em {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : ''} às{' '}
            {selectedSlot ? formatTimeLabel(selectedSlot) : ''}
          </p>
          <Button onClick={() => navigate('/minhas-reservas')}>Ver minhas reservas</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar para serviços
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">{service.name}</h1>
        <p className="text-muted-foreground">
          {service.duration_minutes} min • R$ {Number(service.price).toFixed(2)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Escolha a data</CardTitle>
            <CardDescription>Selecione um dia disponível</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={date => {
                setSelectedDate(date);
                setSelectedSlot(null);
              }}
              disabled={date => date < new Date(new Date().setHours(0, 0, 0, 0))}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Horários disponíveis</CardTitle>
            <CardDescription>
              {selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione uma data'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {submitError ? (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            ) : null}

            {!selectedDate ? (
              <p className="text-sm text-muted-foreground">Escolha uma data no calendário ao lado.</p>
            ) : isBlocked ? (
              <p className="text-sm text-muted-foreground">A designer não está disponível nesta data.</p>
            ) : dayBookingsLoading ? (
              <p className="text-sm text-muted-foreground">Carregando horários…</p>
            ) : availableSlots.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum horário livre nesta data.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map(slot => (
                  <Button
                    key={slot}
                    variant={selectedSlot === slot ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {formatTimeLabel(slot)}
                  </Button>
                ))}
              </div>
            )}

            <Button className="w-full" disabled={!selectedSlot || submitting} onClick={handleConfirm}>
              {submitting ? 'Confirmando…' : 'Confirmar reserva'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
