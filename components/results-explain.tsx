'use client';

import { AnalysisRunResult, Entitlements } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface ResultsExplainProps {
  result: AnalysisRunResult;
  entitlements: Entitlements;
}

export function ResultsExplain({ result, entitlements }: ResultsExplainProps) {
  const [copied, setCopied] = useState(false);
  const bundle = result.explain_bundle;

  const handleCopy = () => {
    navigator.clipboard.writeText(result.methods_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {!entitlements.features.full_equations && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Lock className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Upgrade to Pro to unlock full equations</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Get detailed mathematical derivations, citations, and methods critique
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Key Equation</CardTitle>
        </CardHeader>
        <CardContent>
          {entitlements.features.full_equations && bundle.equations ? (
            <p className="font-mono text-sm bg-muted p-3 rounded">{bundle.equations}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Brief formula summary visible to Free users. Upgrade to see full equations.
            </p>
          )}
        </CardContent>
      </Card>

      {entitlements.features.full_equations && bundle.citations && bundle.citations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Citations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bundle.citations.map((citation) => (
                <div key={citation.id} className="border-l-2 border-muted pl-3 py-1">
                  <p className="text-sm font-medium">{citation.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {citation.authors} ({citation.year})
                  </p>
                  {citation.doi && (
                    <p className="text-xs text-blue-600">
                      <a href={`https://doi.org/${citation.doi}`} target="_blank" rel="noopener noreferrer">
                        {citation.doi}
                      </a>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {entitlements.features.full_equations && bundle.critique && bundle.critique.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reviewer Critique</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {bundle.critique.map((point, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm whitespace-pre-wrap">{result.methods_text}</p>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Methods
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
