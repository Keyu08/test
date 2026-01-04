'use client';

import { useState } from 'react';
import { useAgent } from '@/lib/agent-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function PairingModal() {
  const { isConnected, isLoading, error, setPairingToken } = useAgent();
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setIsSubmitting(true);
    try {
      await setPairingToken(token);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return null;
  }

  if (isConnected) {
    return null;
  }

  return (
    <Dialog open={!isConnected && !isLoading} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Methodica Agent</DialogTitle>
          <DialogDescription>
            Enter your pairing token to connect to the local analysis agent
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <div className="space-y-1">
                <AlertDescription className="font-medium">{error}</AlertDescription>
                {error.includes('Cannot reach agent') && (
                  <p className="text-xs text-muted-foreground">
                    Run <code className="bg-muted px-1 py-0.5 rounded">npm run agent</code> in a terminal first
                  </p>
                )}
                {error.includes('Invalid') && (
                  <p className="text-xs text-muted-foreground">
                    Double-check the token from the agent console
                  </p>
                )}
              </div>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="token">Pairing Token</Label>
            <Input
              id="token"
              placeholder="Enter pairing token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={isSubmitting}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Run <code className="bg-muted px-1 py-0.5 rounded">npm run agent</code> in a terminal to start the agent and get the token
            </p>
          </div>

          <Button type="submit" disabled={!token.trim() || isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Connecting...' : 'Connect'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
