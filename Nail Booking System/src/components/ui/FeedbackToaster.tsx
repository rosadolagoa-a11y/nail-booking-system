import React from 'react';
import { Toaster } from 'sonner';

export const FeedbackToaster: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        className: 'font-sans text-sm shadow-md border rounded-lg',
        style: {
          background: 'var(--card)',
          color: 'var(--card-foreground)',
          borderColor: 'var(--border)',
        },
      }}
    />
  );
};
