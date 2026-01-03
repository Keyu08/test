export type AnalysisType = 'two_group_comparison' | 'one_way_anova' | 'correlation' | 'dose_response';

export type Severity = 'info' | 'warning' | 'error';

export type RiskLevel = 'none' | 'low' | 'medium' | 'high';

export interface Warning {
  id: string;
  severity: Severity;
  message: string;
  recommended_action?: string;
  evidence?: string;
}

export interface DatasetSchema {
  columns: Array<{
    name: string;
    type: 'numeric' | 'categorical' | 'text';
    non_null_count: number;
    null_count: number;
  }>;
  n_rows: number;
  candidate_x?: string[];
  candidate_y?: string[];
  candidate_group?: string[];
  has_replicates_hint: boolean;
  paired_hint?: boolean;
  control_group?: string;
  is_paired: boolean;
  are_biological_replicates: boolean;
}

export interface GoalSpec {
  description: string;
  analysis_type: AnalysisType;
  x_column?: string;
  y_column?: string;
  group_column?: string;
  context: 'biology' | 'chemistry' | 'medicine' | 'other';
  custom_goal?: string;
}

export interface AnalysisPlan {
  id: string;
  created_at: number;
  goal_spec: GoalSpec;
  dataset_schema: DatasetSchema;
  recommended_analysis: {
    type: AnalysisType;
    rationale: string;
    parametric: boolean;
    assumptions: string[];
  };
  recommended_plot: {
    title: string;
    plot_type: string;
    axes: {
      x: string;
      y: string;
    };
  };
  assumptions_checks: Array<{
    name: string;
    required: boolean;
    pass?: boolean;
  }>;
  is_valid: boolean;
  errors: Warning[];
  warnings: Warning[];
  risk_level: RiskLevel;
  override_log?: Array<{
    timestamp: number;
    justification?: string;
  }>;
}

export interface AnalysisRunResult {
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

export interface AnalysisRun {
  id: string;
  created_at: number;
  plan_id: string;
  dataset_hash: string;
  engine_version: string;
  result: AnalysisRunResult;
  override_log: Array<{
    timestamp: number;
    justification?: string;
  }>;
}

export interface Entitlements {
  is_pro: boolean;
  features: {
    svg_export: boolean;
    pdf_export: boolean;
    full_equations: boolean;
  };
}

export interface DatasetMetadata {
  id: string;
  filename: string;
  uploaded_at: number;
  size_bytes: number;
  n_rows: number;
  n_columns: number;
  hash: string;
  schema: DatasetSchema;
  summary?: Record<string, unknown>;
  raw_data?: string;
}
