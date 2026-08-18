import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { format, parse, addMinutes, isBefore, isAfter, isEqual } from 'date-fns';
import { bookingDataService, AvailabilityData } from '../../../services/bookingDataService';
import { createBooking } from '../../../actions/createBooking';
import { Service, Booking } from '../../../types/database.types';

interface BookingFlowProps {
  clientId: number;
  onSuccess?: (booking: Booking) => void;
  onError?: (errorMessage: string) => void;
}

export const BookingFlow: React.FC<BookingFlowProps> = ({
  clientId,
  onSuccess,
  onError,
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [isLoadingServices, setIsLoadingServices] = useState<boolean>(true);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Carregar lista de serviços ativos
  useEffect(() => {
    let isMounted = true;
    const fetchServices = async () => {
      setIsLoadingServices(true);
      try {
        const data = await bookingDataService.getActiveServices();
        if (isMounted) {
          setServices(data);
          if (data.length > 0) {
            setSelectedServiceId(data[0].id);
          }
        }
      } catch (err) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Erro ao carregar serviços.';
          setErrorMessage(msg);
          onError?.(msg);
        }
      } finally {
        if (isMounted) setIsLoadingServices(false);
      }
    };

    void fetchServices();
    return () => {
      isMounted = false;
    };
  }, [onError]);

  // 2. Carregar disponibilidade para a data selecionada
  const fetchAvailability = useCallback(async (dateStr: string) => {
    setIsLoadingAvailability(true);
    setErrorMessage(null);
    try {
      const data = await bookingDataService.getAvailabilityByDate(dateStr);
      setAvailability(data);
      setSelectedTimeSlot(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao consultar disponibilidade.';
      setErrorMessage(msg);
      onError?.(msg);
    } finally {
      setIsLoadingAvailability(false);
    }
  }, [onError]);

  useEffect(() => {
    if (selectedDate) {
      void fetchAvailability(selectedDate);
    }
  }, [selectedDate, fetchAvailability]);

  // Identificar serviço selecionado
  const currentService = useMemo(() => {
    return services.find((s) => s.id === selectedServiceId) || null;
  }, [services, selectedServiceId]);

  // 3. Cálculo determinístico dos Slots de Horário
  const availableSlots = useMemo(() => {
    if (!availability || !currentService) return [];
    if (availability.isBlocked || !availability.workingHours || availability.workingHours.is_closed) {
      return [];
    }

    const { start_time, end_time } = availability.workingHours;
    if (!start_time || !end_time) return [];

    const baseDate = new Date(2000, 0, 1);
    const workStart = parse(start_time.slice(0, 5), 'HH:mm', baseDate);
    const workEnd = parse(end_time.slice(0, 5), 'HH:mm', baseDate);

    const slots: { startTime: string; endTime: string; available: boolean }[] = [];
    let currentSlotStart = workStart;

    while (true) {
      const currentSlotEnd = addMinutes(currentSlotStart, currentService.duration_minutes);
      
      // Se o término do atendimento ultrapassa o fim do expediente, encerra
      if (isAfter(currentSlotEnd, workEnd)) {
        break;
      }

      const slotStartStr = format(currentSlotStart, 'HH:mm');
      const slotEndStr = format(currentSlotEnd, 'HH:mm');

      // Checagem de colisão com reservas existentes do dia
      const hasCollision = availability.bookings.some((b) => {
        const bookingStart = parse(b.start_time.slice(0, 5), 'HH:mm', baseDate);
        const bookingEnd = parse(b.end_time.slice(0, 5), 'HH:mm', baseDate);

        // Condição de sobreposição: max(start1, start2) < min(end1, end2)
        const startsBeforeBookingEnds = isBefore(currentSlotStart, bookingEnd);
        const endsAfterBookingStarts = isAfter(currentSlotEnd, bookingStart);

        return startsBeforeBookingEnds && endsAfterBookingStarts;
      });

      slots.push({
        startTime: slotStartStr,
        endTime: slotEndStr,
        available: !hasCollision,
      });

      // Passo de 30 minutos entre inícios de slots
      currentSlotStart = addMinutes(currentSlotStart, 30);
      if (isAfter(currentSlotStart, workEnd) || isEqual(currentSlotStart, workEnd)) {
        break;
      }
    }

    return slots;
  }, [availability, currentService]);

  // 4. Submissão do Agendamento
  const handleBookingSubmit = async () => {
    if (!selectedServiceId || !selectedDate || !selectedTimeSlot) {
      setErrorMessage('Selecione o serviço, a data e um horário disponível.');
      return;
    }

    const chosenSlot = availableSlots.find((s) => s.startTime === selectedTimeSlot);
    if (!chosenSlot || !chosenSlot.available) {
      setErrorMessage('O horário selecionado não está mais disponível.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await createBooking(
      { id: clientId, role: 'client' },
      {
        service_id: selectedServiceId,
        booking_date: selectedDate,
        start_time: chosenSlot.startTime,
        end_time: chosenSlot.endTime,
      }
    );

    setIsSubmitting(false);

    if (!result.success || !result.booking) {
      setErrorMessage(result.error || 'Falha ao confirmar o agendamento.');
      onError?.(result.error || 'Falha ao confirmar o agendamento.');
      // Atualiza os horários para refletir a nova ocupação em caso de conflito
      void fetchAvailability(selectedDate);
      return;
    }

    onSuccess?.(result.booking);
  };

  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-md">
      <h2 className="text-xl font-bold text-foreground mb-6">Novo Agendamento</h2>

      {errorMessage && (
        <div className="mb-4 rounded-lg bg-destructive/10 p-4 border border-destructive text-destructive text-sm font-medium">
          {errorMessage}
        </div>
      )}

      {/* Seleção de Serviço */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-foreground mb-2">
          1. Selecione o Serviço
        </label>
        {isLoadingServices ? (
          <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => {
                  setSelectedServiceId(service.id);
                  setSelectedTimeSlot(null);
                }}
                className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
                  selectedServiceId === service.id
                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                    : 'border-border bg-background hover:bg-muted/50'
                }`}
              >
                <span className="font-semibold text-foreground">{service.name}</span>
                <span className="text-xs text-muted-foreground">{service.duration_minutes} min</span>
                <span className="mt-1 text-sm font-bold text-primary">
                  R$ {Number(service.price).toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Seleção de Data */}
      <div className="mb-6">
        <label htmlFor="booking-date-input" className="block text-sm font-semibold text-foreground mb-2">
          2. Escolha a Data
        </label>
        <input
          id="booking-date-input"
          type="date"
          value={selectedDate}
          min={format(new Date(), 'yyyy-MM-dd')}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Seleção de Horário */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-foreground mb-2">
          3. Horários Disponíveis
        </label>
        {isLoadingAvailability ? (
          <div className="grid grid-cols-3 gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : availability?.isBlocked ? (
          <p className="text-sm text-destructive">
            Data indisponível: {availability.blockedReason || 'Atendimento suspenso nesta data.'}
          </p>
        ) : availability?.workingHours?.is_closed ? (
          <p className="text-sm text-muted-foreground">Estabelecimento fechado neste dia da semana.</p>
        ) : availableSlots.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum horário compatível disponível para esta data.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {availableSlots.map((slot) => (
              <button
                key={slot.startTime}
                type="button"
                disabled={!slot.available}
                onClick={() => setSelectedTimeSlot(slot.startTime)}
                className={`py-2 px-3 rounded-md text-xs font-semibold border transition-all ${
                  !slot.available
                    ? 'border-border/50 bg-muted/40 text-muted-foreground/40 cursor-not-allowed line-through'
                    : selectedTimeSlot === slot.startTime
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-background text-foreground hover:border-primary/50'
                }`}
              >
                {slot.startTime} - {slot.endTime}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Botão de Confirmação */}
      <button
        type="button"
        disabled={!selectedServiceId || !selectedTimeSlot || isSubmitting}
        onClick={() => void handleBookingSubmit()}
        className="w-full rounded-md bg-primary py-3 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isSubmitting ? 'Confirmando Agendamento...' : 'Confirmar Reserva'}
      </button>
    </div>
  );
};
