'use client';

import { useState } from 'react';
import { AnalysisPlan, Warning } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface PlanReviewProps {
  plan: AnalysisPlan;
  isValid: boolean;
  errors: Warning[];
  warnings: Warning[];
  riskLevel: 'none' | 'low' | 'medium' | 'high';
  onConfirm: (override: boolean, justification?: string) => void;
  isLoading?: boolean;
}

export function PlanReview({
  plan,
  isValid,
  errors,
  warnings,
  riskLevel,
  onConfirm,
  isLoading = false,
}: PlanReviewProps) {
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [justification, setJustification] = useState('');

  const handleRun = () => {
    if (isValid) {
      onConfirm(false);
    } else if (riskLevel !== 'none') {
      setShowOverrideModal(true);
    }
  };

  const handleOverride = () => {
    if (understood) {
      onConfirm(true, justification);
      setShowOverrideModal(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Recommended Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">Type</p>
            <p className="text-sm text-muted-foreground">{plan.recommended_analysis.type}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Rationale</p>
            <p className="text-sm text-muted-foreground">{plan.recommended_analysis.rationale}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Parametric</p>
            <p className="text-sm text-muted-foreground">
              {plan.recommended_analysis.parametric ? 'Yes' : 'No (non-parametric)'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recommended Plot</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p className="text-sm font-medium mb-1">{plan.recommended_plot.title}</p>
            <p className="text-sm text-muted-foreground">
              {plan.recommended_plot.axes.x} vs {plan.recommended_plot.axes.y}
            </p>
          </div>
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {errors.map((error) => (
                <div key={error.id} className="text-sm">
                  <p className="font-medium text-red-600">{error.message}</p>
                  {error.recommended_action && (
                    <p className="text-xs text-muted-foreground mt-1">→ {error.recommended_action}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {warnings.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {warnings.map((warning) => (
                <div key={warning.id} className="text-sm">
                  <p className="font-medium text-yellow-700">{warning.message}</p>
                  {warning.recommended_action && (
                    <p className="text-xs text-muted-foreground mt-1">→ {warning.recommended_action}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assumption Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {plan.assumptions_checks.map((check) => (
              <div key={check.name} className="flex items-center gap-2 text-sm">
                <div className="flex-1">{check.name}</div>
                <span className="text-xs bg-muted px-2 py-1 rounded">
                  {check.required ? 'Required' : 'Recommended'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          onClick={handleRun}
          disabled={isLoading || (errors.length > 0 && riskLevel === 'high')}
          className="flex-1"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Running Analysis...' : 'Run Analysis'}
        </Button>
      </div>

      <Dialog open={showOverrideModal} onOpenChange={setShowOverrideModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Analysis</DialogTitle>
            <DialogDescription>
              There are {errors.length} error(s) and {warnings.length} warning(s). Proceed?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox id="understand" checked={understood} onCheckedChange={(c) => setUnderstood(!!c)} />
              <Label htmlFor="understand" className="font-normal cursor-pointer text-sm">
                I understand the risks and want to proceed
              </Label>
            </div>

            <div>
              <Label htmlFor="justification" className="text-sm">
                Justification (optional)
              </Label>
              <Textarea
                id="justification"
                placeholder="Why are you proceeding despite the warnings?"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className="text-sm mt-2"
                disabled={!understood}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowOverrideModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleOverride} disabled={!understood} className="flex-1">
                Proceed
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
