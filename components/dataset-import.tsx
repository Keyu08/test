'use client';

import { useState } from 'react';
import { useAgent } from '@/lib/agent-context';
import { parseCSV, inferColumnTypes, getCSVHash, getPreview } from '@/lib/csv-utils';
import { saveDataset } from '@/lib/idb';
import { DatasetMetadata, DatasetSchema } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface DatasetImportProps {
  onComplete: (dataset: DatasetMetadata) => void;
}

export function DatasetImport({ onComplete }: DatasetImportProps) {
  const { client } = useAgent();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    if (!client) {
      setError('Agent not connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const content = await file.text();
      const parsed = await parseCSV(content);

      const columnTypes = await inferColumnTypes(parsed.headers, parsed.rows);

      const schema: DatasetSchema = {
        columns: columnTypes,
        n_rows: parsed.rows.length,
        candidate_x: columnTypes.filter((c) => c.type === 'numeric').map((c) => c.name),
        candidate_y: columnTypes.filter((c) => c.type === 'numeric').map((c) => c.name),
        candidate_group: columnTypes.filter((c) => c.type === 'categorical').map((c) => c.name),
        has_replicates_hint: false,
        paired_hint: undefined,
        control_group: undefined,
        is_paired: false,
        are_biological_replicates: true,
      };

      const hash = getCSVHash(content);
      const metadata: DatasetMetadata = {
        id: uuidv4(),
        filename: file.name,
        uploaded_at: Date.now(),
        size_bytes: file.size,
        n_rows: parsed.rows.length,
        n_columns: parsed.headers.length,
        hash,
        schema,
        raw_data: content,
      };

      await saveDataset(metadata);
      onComplete(metadata);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Dataset</CardTitle>
        <CardDescription>Upload CSV or paste table data to get started</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <label htmlFor="csv-upload" className="cursor-pointer">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="font-medium">Click to upload CSV</p>
            <p className="text-sm text-muted-foreground">or drag and drop</p>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              disabled={isLoading}
              className="hidden"
            />
          </label>
        </div>

        {isLoading && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Parsing CSV...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
