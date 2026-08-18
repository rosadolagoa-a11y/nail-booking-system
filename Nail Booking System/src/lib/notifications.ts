import { toast } from 'sonner';

export const notify = {
  success: (message: string, description?: string) => {
    toast.success(message, { description });
  },

  error: (message: string, description?: string) => {
    toast.error(message, { description });
  },

  info: (message: string, description?: string) => {
    toast.info(message, { description });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, { description });
  },

  // Utilitário especializado para tratar erros retornados pelo PostgreSQL / Supabase
  handleDatabaseError: (error: unknown, fallbackMessage = 'Ocorreu um erro inesperado.') => {
    const errorStr = typeof error === 'string' ? error : error instanceof Error ? error.message : '';

    if (errorStr.includes('23P01') || errorStr.toLowerCase().includes('conflito') || errorStr.toLowerCase().includes('double_booking')) {
      toast.error('Horário Indisponível', {
        description: 'Este horário acabou de ser reservado por outro cliente. Por favor, escolha outro slot.',
      });
      return;
    }

    if (errorStr.toLowerCase().includes('expediente') || errorStr.toLowerCase().includes('fora do horário')) {
      toast.error('Fora do Horário de Atendimento', {
        description: 'O agendamento solicitado não respeita o expediente configurado.',
      });
      return;
    }

    toast.error(fallbackMessage, {
      description: errorStr || undefined,
    });
  },
};
