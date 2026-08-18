import { Link } from 'react-router-dom';
import { Layers, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 px-4">
      <div className="h-12 w-12 rounded-xl bg-primary-50 border border-primary-200 text-primary-600 flex items-center justify-center font-bold">
        <Layers className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-foreground">404 - Route Not Found</h1>
        <p className="text-xs text-foreground-secondary max-w-sm">
          The requested warehouse operations route does not exist or has been moved.
        </p>
      </div>
      <Link to="/dashboard">
        <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Return to Command Center
        </Button>
      </Link>
    </div>
  );
}
