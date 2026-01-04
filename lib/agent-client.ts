import { AnalysisRun, AnalysisPlan, DatasetSchema, Warning } from './types';

const AGENT_URL = 'http://127.0.0.1:7337';

export interface PlanValidationResponse {
  is_valid: boolean;
  errors: Warning[];
  warnings: Warning[];
  risk_level: 'none' | 'low' | 'medium' | 'high';
}

export interface RunResponse {
  results_json: Record<string, unknown>;
  warnings_json: Warning[];
  diagnostics_json: Record<string, unknown>;
  plot_spec_json: Record<string, unknown>;
  methods_text: string;
  explain_bundle: {
    equations?: string;
    citations: Array<{
      id: string;
      title: string;
      authors: string;
      year: number;
      doi?: string;
    }>;
    critique: string[];
  };
}

export interface DatasetParseResponse {
  schema: DatasetSchema;
  warnings: Warning[];
}

export interface DatasetSummarizeResponse {
  summaries: Record<string, unknown>;
}

export class AgentClient {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-Methodica-Token': this.token,
      'X-CSRF-Token': 'client',
    };
  }

  async health(): Promise<{ status: string; version: string }> {
    try {
      const response = await fetch(`${AGENT_URL}/health`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        let errorMsg = `Agent health check failed: ${response.status}`;
        try {
          const data = await response.json();
          if (data.error) errorMsg = data.error;
        } catch {
          // Ignore JSON parse errors
        }
        throw new Error(errorMsg);
      }

      return response.json();
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new Error('Cannot reach agent. Is it running on http://127.0.0.1:7337?');
      }
      throw err;
    }
  }

  async parseDataset(csvContent: string): Promise<DatasetParseResponse> {
    const response = await fetch(`${AGENT_URL}/dataset/parse`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ csv_content: csvContent }),
    });

    if (!response.ok) {
      throw new Error(`Failed to parse dataset: ${response.status}`);
    }

    return response.json();
  }

  async summarizeDataset(schema: DatasetSchema, csvContent: string): Promise<DatasetSummarizeResponse> {
    const response = await fetch(`${AGENT_URL}/dataset/summarize`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        dataset_schema: schema,
        csv_content: csvContent,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to summarize dataset: ${response.status}`);
    }

    return response.json();
  }

  async validatePlan(plan: Partial<AnalysisPlan>): Promise<PlanValidationResponse> {
    const response = await fetch(`${AGENT_URL}/plan/validate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ plan }),
    });

    if (!response.ok) {
      throw new Error(`Failed to validate plan: ${response.status}`);
    }

    return response.json();
  }

  async run(plan: AnalysisPlan, csvContent: string): Promise<RunResponse> {
    const response = await fetch(`${AGENT_URL}/run`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ plan, csv_content: csvContent }),
    });

    if (!response.ok) {
      throw new Error(`Failed to run analysis: ${response.status}`);
    }

    return response.json();
  }

  async export(format: 'png' | 'svg' | 'pdf', plotSpec: Record<string, unknown>): Promise<ArrayBuffer> {
    const response = await fetch(`${AGENT_URL}/export`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ format, plot_spec: plotSpec }),
    });

    if (!response.ok) {
      throw new Error(`Failed to export: ${response.status}`);
    }

    return response.arrayBuffer();
  }
}

export function getAgentClient(): AgentClient | null {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('methodica_pairing_token');
  if (!token) return null;

  return new AgentClient(token);
}

export async function setAgentToken(token: string): Promise<void> {
  localStorage.setItem('methodica_pairing_token', token);
}

export function getAgentToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('methodica_pairing_token');
}

export function clearAgentToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('methodica_pairing_token');
}
