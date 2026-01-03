'use client';

import { useEffect, useState } from 'react';
import { AgentProvider, useAgent } from '@/lib/agent-context';
import { PairingModal } from '@/components/pairing-modal';
import { AgentStatusBanner } from '@/components/agent-status-banner';
import { DatasetImport } from '@/components/dataset-import';
import { SchemaReview } from '@/components/schema-review';
import { GoalPicker } from '@/components/goal-picker';
import { PlanReview } from '@/components/plan-review';
import { VegaFigure } from '@/components/vega-figure';
import { ResultsStats } from '@/components/results-stats';
import { ResultsExplain } from '@/components/results-explain';
import { ResultsAudit } from '@/components/results-audit';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import {
  DatasetMetadata,
  GoalSpec,
  AnalysisPlan,
  AnalysisRun,
  Entitlements,
} from '@/lib/types';
import { initDB, saveDataset, savePlan, saveRun, getDataset, getPlan, getRun } from '@/lib/idb';
import { loadEntitlements, saveEntitlements, verifyLicense } from '@/lib/entitlements';
import { v4 as uuidv4 } from 'uuid';

type AppStep = 'import' | 'schema' | 'goal' | 'plan' | 'results' | 'settings';

function AppContent() {
  const { client, isConnected, isLoading: agentLoading } = useAgent();

  const [step, setStep] = useState<AppStep>('import');
  const [dataset, setDataset] = useState<DatasetMetadata | null>(null);
  const [goal, setGoal] = useState<GoalSpec | null>(null);
  const [plan, setPlan] = useState<AnalysisPlan | null>(null);
  const [run, setRun] = useState<AnalysisRun | null>(null);
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  useEffect(() => {
    initDB().catch(console.error);
    const ent = loadEntitlements();
    setEntitlements(ent);
  }, []);

  if (agentLoading || !entitlements) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <AgentStatusBanner />
        <PairingModal />
      </div>
    );
  }

  const handleDatasetComplete = async (meta: DatasetMetadata) => {
    await saveDataset(meta);
    setDataset(meta);
    setStep('schema');
  };

  const handleSchemaConfirm = async (meta: DatasetMetadata) => {
    await saveDataset(meta);
    setDataset(meta);
    setStep('goal');
  };

  const handleGoalConfirm = async (spec: GoalSpec) => {
    setGoal(spec);

    setPlanError(null);

    try {
      const mockPlan: AnalysisPlan = {
        id: uuidv4(),
        created_at: Date.now(),
        goal_spec: spec,
        dataset_schema: dataset!.schema,
        recommended_analysis: {
          type: spec.analysis_type,
          rationale: 'Based on your data characteristics and study design',
          parametric: true,
          assumptions: ['Normality', 'Homogeneity of variance', 'Independence'],
        },
        recommended_plot: {
          title: 'Data Visualization',
          plot_type: 'scatter',
          axes: {
            x: dataset!.schema.candidate_x?.[0] || 'X',
            y: dataset!.schema.candidate_y?.[0] || 'Y',
          },
        },
        assumptions_checks: [
          { name: 'Normality (Shapiro-Wilk)', required: true },
          { name: 'Homogeneity (Levene)', required: true },
          { name: 'Independence', required: true },
        ],
        is_valid: true,
        errors: [],
        warnings: [],
        risk_level: 'none',
      };

      setPlan(mockPlan);
      await savePlan(mockPlan);
      setStep('plan');
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : 'Failed to validate plan');
    }
  };

  const handleRunAnalysis = async (override: boolean, justification?: string) => {
    if (!client || !plan || !dataset) return;

    setIsRunning(true);
    setPlanError(null);

    try {
      const result = await client.run(plan, dataset.raw_data || '');

      const analysis: AnalysisRun = {
        id: uuidv4(),
        created_at: Date.now(),
        plan_id: plan.id,
        dataset_hash: dataset.hash,
        engine_version: '1.0.0',
        result,
        override_log: override
          ? [
              {
                timestamp: Date.now(),
                justification,
              },
            ]
          : [],
      };

      await saveRun(analysis);
      setRun(analysis);
      setStep('results');
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsRunning(false);
    }
  };

  const handleExport = async (format: 'png' | 'svg' | 'pdf') => {
    if (!client || !run) return;

    try {
      const buffer = await client.export(format, run.result.plot_spec_json);
      const blob = new Blob([buffer]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analysis.${format}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AgentStatusBanner />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {step === 'import' && (
          <DatasetImport onComplete={handleDatasetComplete} />
        )}

        {step === 'schema' && dataset && (
          <SchemaReview dataset={dataset} onConfirm={handleSchemaConfirm} />
        )}

        {step === 'goal' && dataset && (
          <GoalPicker dataset={dataset} onConfirm={handleGoalConfirm} />
        )}

        {step === 'plan' && plan && goal && (
          <PlanReview
            plan={plan}
            isValid={plan.is_valid}
            errors={plan.errors}
            warnings={plan.warnings}
            riskLevel={plan.risk_level}
            onConfirm={handleRunAnalysis}
            isLoading={isRunning}
          />
        )}

        {step === 'results' && run && plan && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Results</h1>

            <Tabs defaultValue="figure">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="figure">Figure</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
                <TabsTrigger value="explain">Explain</TabsTrigger>
                <TabsTrigger value="audit">Audit</TabsTrigger>
              </TabsList>

              <TabsContent value="figure" className="mt-4">
                <VegaFigure
                  spec={run.result.plot_spec_json}
                  title="Analysis Figure"
                  onExport={handleExport}
                  isProUser={entitlements.is_pro}
                />
              </TabsContent>

              <TabsContent value="stats" className="mt-4">
                <ResultsStats result={run.result} />
              </TabsContent>

              <TabsContent value="explain" className="mt-4">
                <ResultsExplain result={run.result} entitlements={entitlements} />
              </TabsContent>

              <TabsContent value="audit" className="mt-4">
                <ResultsAudit run={run} plan={plan} />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {step === 'settings' && (
          <div className="text-center">Settings placeholder</div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AgentProvider>
      <AppContent />
    </AgentProvider>
  );
}
