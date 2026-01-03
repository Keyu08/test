'use client';

import { useState } from 'react';
import { AnalysisType, DatasetMetadata, GoalSpec } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BarChart3, TrendingUp, Activity, Zap } from 'lucide-react';

interface GoalPickerProps {
  dataset: DatasetMetadata;
  onConfirm: (goal: GoalSpec) => void;
}

const GOALS: Array<{
  id: AnalysisType;
  title: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'two_group_comparison',
    title: 'Compare Two Groups',
    description: 'Test for differences between treatment and control',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    id: 'one_way_anova',
    title: 'Compare Multiple Groups',
    description: 'Test differences across 3+ groups',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    id: 'correlation',
    title: 'Correlation / Trend',
    description: 'Assess relationship between two variables',
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    id: 'dose_response',
    title: 'Dose-Response',
    description: 'Fit 4-parameter logistic curve',
    icon: <Activity className="h-5 w-5" />,
  },
];

const CONTEXTS = [
  { value: 'biology', label: 'Biology' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'medicine', label: 'Medicine' },
  { value: 'other', label: 'Other' },
];

export function GoalPicker({ dataset, onConfirm }: GoalPickerProps) {
  const [selectedGoal, setSelectedGoal] = useState<AnalysisType | 'custom'>('two_group_comparison');
  const [context, setContext] = useState<'biology' | 'chemistry' | 'medicine' | 'other'>('biology');
  const [customGoal, setCustomGoal] = useState('');

  const handleConfirm = () => {
    const goal: GoalSpec = {
      description:
        selectedGoal === 'custom'
          ? customGoal
          : GOALS.find((g) => g.id === selectedGoal)?.description || '',
      analysis_type: selectedGoal as AnalysisType,
      context,
      custom_goal: selectedGoal === 'custom' ? customGoal : undefined,
    };
    onConfirm(goal);
  };

  const isReady = selectedGoal !== 'custom' || customGoal.trim() !== '';

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>What is your analysis goal?</CardTitle>
          <CardDescription>Select the type of analysis you want to perform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {GOALS.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedGoal === goal.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{goal.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{goal.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{goal.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 p-4 border rounded-lg">
            <Label htmlFor="custom-goal" className="text-sm font-medium mb-2 block">
              Or enter a custom goal
            </Label>
            <Textarea
              id="custom-goal"
              placeholder="Describe your analysis goal in detail..."
              value={customGoal}
              onChange={(e) => {
                setCustomGoal(e.target.value);
                if (e.target.value.trim()) {
                  setSelectedGoal('custom');
                }
              }}
              className="text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Field context</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={context}
            onValueChange={(v) => setContext(v as typeof context)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONTEXTS.map((ctx) => (
                <SelectItem key={ctx.value} value={ctx.value}>
                  {ctx.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Button onClick={handleConfirm} disabled={!isReady} className="w-full">
        Continue
      </Button>
    </div>
  );
}
