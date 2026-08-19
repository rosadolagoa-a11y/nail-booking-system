import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, DollarSign, Sparkles } from 'lucide-react';
import loadActiveServices from '@/actions/loadActiveServices';
import type { Service } from '@/types/database.types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function ServicesList() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    loadActiveServices()
      .then(data => {
        if (isMounted) setServices(data);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Nossos Serviços</h1>
        <p className="text-muted-foreground">Escolha um serviço para agendar seu horário</p>
      </div>

      {error ? <p className="text-sm text-destructive">Erro ao carregar serviços.</p> : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(service => (
            <Card key={service.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-4 w-4" />
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                </div>
                {service.description ? <CardDescription>{service.description}</CardDescription> : null}
              </CardHeader>
              <CardContent className="flex flex-1 items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {service.duration_minutes} min
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" /> R$ {Number(service.price).toFixed(2)}
                </span>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to={`/reservar/${service.id}`}>Agendar</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
          {!loading && services.length === 0 ? (
            <p className="col-span-full text-center text-sm text-muted-foreground">
              Nenhum serviço disponível no momento.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
