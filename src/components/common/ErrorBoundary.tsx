import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('WAREFLOW Uncaught Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-4 bg-white rounded-lg border border-border shadow-card m-4">
          <div className="p-3 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-base font-bold text-foreground">Operational Module Error</h3>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              An unexpected error occurred while rendering this warehouse telemetry view.
              Your underlying state remains protected.
            </p>
            {this.state.error && (
              <p className="text-[11px] font-mono text-rose-700 bg-rose-50 p-2 rounded border border-rose-200 mt-2 text-left overflow-x-auto">
                {this.state.error.message}
              </p>
            )}
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={this.handleReset}
          >
            Reload Module
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
