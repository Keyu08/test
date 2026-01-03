'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AgentClient, getAgentToken, setAgentToken, clearAgentToken } from './agent-client';

interface AgentContextType {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  client: AgentClient | null;
  token: string | null;
  setPairingToken: (token: string) => Promise<void>;
  clearPairing: () => void;
  checkConnection: () => Promise<void>;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<AgentClient | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = getAgentToken();
    if (storedToken) {
      setToken(storedToken);
      const newClient = new AgentClient(storedToken);
      setClient(newClient);

      newClient
        .health()
        .then(() => {
          setIsConnected(true);
          setError(null);
        })
        .catch(() => {
          setIsConnected(false);
          setError('Agent is unreachable');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const setPairingToken = async (newToken: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const newClient = new AgentClient(newToken);
      await newClient.health();

      await setAgentToken(newToken);
      setToken(newToken);
      setClient(newClient);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err.message : 'Failed to connect to agent');
      setClient(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearPairing = () => {
    clearAgentToken();
    setToken(null);
    setClient(null);
    setIsConnected(false);
    setError(null);
  };

  const checkConnection = async () => {
    if (!client) return;

    try {
      await client.health();
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setIsConnected(false);
      setError('Agent connection lost');
    }
  };

  return (
    <AgentContext.Provider
      value={{
        isConnected,
        isLoading,
        error,
        client,
        token,
        setPairingToken,
        clearPairing,
        checkConnection,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within AgentProvider');
  }
  return context;
}
