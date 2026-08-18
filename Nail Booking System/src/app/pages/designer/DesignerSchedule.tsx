import { useState } from 'react';
import { format } from 'date-fns';
import { toDateOnly } from '@/app/lib/timeUtils';
import { ptBR } from 'date-fns/locale';
import { Plus, Trash2 } from 'lucide-react';
import { useLoadAction, useMutateAction } from '@uibakery/data';
import loadWorkingHours from '@/actions/loadWorkingHours';
import { EMPTY_PARAMS } from '@/app/lib/constants';
import updateWorkingHours from '@/actions/updateWorkingHours';
import loadBlockedDates from '@/actions/loadBlockedDates';
import createBlockedDate from '@/actions/createBlockedDate';
import deleteBlockedDate from '@/actions/deleteBlockedDate';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';

type WorkingHourRow = {
  id: number;
  day_of_week: number;
  start_time: string | null;
  end_time: string | null;
  is_closed: boolean;
};

type BlockedDateRow = { id: number; blocked_date: string; reason: string | null };

const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function DesignerSchedule() {
  const [workingHours, whLoading, , refreshWh]: [WorkingHourRow[], boolean, Error | null, () => Promise<void>] =
    useLoadAction(loadWorkingHours, [], EMPTY_PARAMS);
  const [blockedDates, bdLoading, , refreshBd]: [BlockedDateRow[], boolean, Error | null, () => Promise<void>] =
    useLoadAction(loadBlockedDates, [], EMPTY_PARAMS);

  const [runUpdateWh] = useMutateAction(updateWorkingHours);
  const [runCreateBlocked, creatingBlocked] = useMutateAction(createBlockedDate);
  const [runDeleteBlocked] = useMutateAction(deleteBlockedDate);

  const [newBlockedDate, setNewBlockedDate] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState('');

  const handleWhChange = async (row: WorkingHourRow, changes: Partial<WorkingHourRow>) => {
    const updated = { ...row, ...changes };
    await runUpdateWh({
      dayOfWeek: row.day_of_week,
      startTime: updated.start_time,
      endTime: updated.end_time,
      isClosed: updated.is_closed,
    });
    await refreshWh();
  };

  const handleAddBlocked = async () => {
    if (!newBlockedDate) return;
    await runCreateBlocked({ blockedDate: format(newBlockedDate, 'yyyy-MM-dd'), reason: reason || null });
    setNewBlockedDate(undefined);
    setReason('');
    await refreshBd();
  };

  const handleDeleteBlocked = async (id: number) => {
    await runDeleteBlocked({ id });
    await refreshBd();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Expediente</h1>
        <p className="text-muted-foreground">Configure seus horários de trabalho e bloqueios</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Horário de funcionamento</CardTitle>
          <CardDescription>Defina o expediente para cada dia da semana</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {whLoading ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : (
            workingHours.map(row => (
              <div
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
              >
                <span className="w-24 font-medium">{dayNames[row.day_of_week]}</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    className="w-32"
                    value={row.start_time?.slice(0, 5) ?? ''}
                    disabled={row.is_closed}
                    onChange={e => handleWhChange(row, { start_time: e.target.value })}
                  />
                  <span className="text-muted-foreground">até</span>
                  <Input
                    type="time"
                    className="w-32"
                    value={row.end_time?.slice(0, 5) ?? ''}
                    disabled={row.is_closed}
                    onChange={e => handleWhChange(row, { end_time: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground">Fechado</Label>
                  <Switch
                    checked={row.is_closed}
                    onCheckedChange={checked => handleWhChange(row, { is_closed: checked })}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bloquear uma data</CardTitle>
            <CardDescription>Folgas, feriados ou indisponibilidades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Calendar
              mode="single"
              selected={newBlockedDate}
              onSelect={setNewBlockedDate}
              disabled={date => date < new Date(new Date().setHours(0, 0, 0, 0))}
              className="rounded-md border"
            />
            <div className="space-y-2">
              <Label>Motivo (opcional)</Label>
              <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Ex: Feriado" />
            </div>
            <Button className="w-full" disabled={!newBlockedDate || creatingBlocked} onClick={handleAddBlocked}>
              <Plus className="mr-2 h-4 w-4" /> Bloquear data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datas bloqueadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {bdLoading ? (
              <p className="text-sm text-muted-foreground">Carregando…</p>
            ) : blockedDates.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma data bloqueada.</p>
            ) : (
              blockedDates.map(b => (
                <div key={b.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium">
                      {format(toDateOnly(b.blocked_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                    {b.reason ? <p className="text-sm text-muted-foreground">{b.reason}</p> : null}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteBlocked(b.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
