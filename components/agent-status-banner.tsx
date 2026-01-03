'use client';

import { useAgent } from '@/lib/agent-context';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export function AgentStatusBanner() {
  const { isConnected, error, checkConnection } = useAgent();

  if (isConnected) {
    return null;
  }

  return (
    <Alert variant="destructive" className="rounded-none">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error || 'Agent is not connected'}</span>
        <Button variant="outline" size="sm" onClick={checkConnection}>
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}
