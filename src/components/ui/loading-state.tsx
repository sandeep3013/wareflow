import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Loading warehouse telemetry...', className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center', className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary-600 mb-3" />
      <p className="text-xs font-medium text-foreground-secondary">{message}</p>
    </div>
  );
}
