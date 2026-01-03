'use client';

import { AnalysisPlan, AnalysisRun } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

interface ResultsAuditProps {
  run: AnalysisRun;
  plan: AnalysisPlan;
}

export function ResultsAudit({ run, plan }: ResultsAuditProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Execution Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Run ID</span>
              <p className="font-mono text-xs mt-1 truncate">{run.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Timestamp</span>
              <p className="font-medium text-sm mt-1">{format(new Date(run.created_at), 'MMM d, HH:mm')}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Engine Version</span>
              <p className="font-medium text-sm mt-1">{run.engine_version}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Dataset Hash</span>
              <p className="font-mono text-xs mt-1 truncate">{run.dataset_hash.substring(0, 12)}...</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {run.override_log && run.override_log.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="text-base">Override Log</CardTitle>
            <CardDescription>Plan validation overrides</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {run.override_log.map((override, i) => (
                <div key={i} className="border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">{format(new Date(override.timestamp), 'MMM d, HH:mm')}</p>
                  {override.justification && (
                    <p className="text-sm mt-2 italic">{override.justification}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Analysis Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground block text-xs mb-1">Goal</span>
              <p>{plan.goal_spec.description}</p>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs mb-1">Analysis Type</span>
              <p className="font-mono text-xs">{plan.goal_spec.analysis_type}</p>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs mb-1">Risk Level</span>
              <p className="capitalize">{plan.risk_level}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
