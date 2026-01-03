'use client';

import { AnalysisRunResult } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ResultsStatsProps {
  result: AnalysisRunResult;
}

export function ResultsStats({ result }: ResultsStatsProps) {
  const stats = result.results_json as Record<string, unknown>;
  const diagnostics = result.diagnostics_json as Record<string, unknown>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Test Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="border rounded-lg p-3">
                <p className="text-xs text-muted-foreground uppercase font-medium">{key.replace(/_/g, ' ')}</p>
                <p className="text-lg font-semibold mt-1">
                  {typeof value === 'number' ? value.toFixed(4) : String(value)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {Object.keys(diagnostics).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Diagnostic Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(diagnostics).map(([testName, testResult]) => {
                const test = testResult as Record<string, unknown>;
                return (
                  <div key={testName} className="border rounded-lg p-3">
                    <p className="font-medium text-sm mb-2">{testName.replace(/_/g, ' ')}</p>
                    <div className="text-xs space-y-1">
                      {Object.entries(test).map(([key, val]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="font-mono">
                            {typeof val === 'number' ? val.toFixed(4) : String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
