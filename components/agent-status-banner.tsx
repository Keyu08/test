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

  const getHelpText = () => {
    if (error?.includes('Cannot reach agent')) {
      return 'Make sure to run "npm run agent" in a terminal first';
    }
    if (error?.includes('Invalid or missing pairing token')) {
      return 'Enter the correct pairing token from the agent console';
    }
    return 'Check that the agent is running and the token is correct';
  };

  return (
    <Alert variant="destructive" className="rounded-none">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium text-sm">{error || 'Agent is not connected'}</p>
          <p className="text-xs text-muted-foreground mt-1">{getHelpText()}</p>
        </div>
        <Button variant="outline" size="sm" onClick={checkConnection} className="ml-4">
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}
