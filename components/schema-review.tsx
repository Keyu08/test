'use client';

import { useState } from 'react';
import { DatasetMetadata, DatasetSchema } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SchemaReviewProps {
  dataset: DatasetMetadata;
  onConfirm: (dataset: DatasetMetadata) => void;
}

export function SchemaReview({ dataset, onConfirm }: SchemaReviewProps) {
  const [isPaired, setIsPaired] = useState<'yes' | 'no' | 'not_sure'>('no');
  const [controlGroup, setControlGroup] = useState<string>('');
  const [isBiological, setIsBiological] = useState<'yes' | 'no'>('yes');

  const groupColumns = dataset.schema.candidate_group || [];

  const handleConfirm = () => {
    const updatedDataset = {
      ...dataset,
      schema: {
        ...dataset.schema,
        is_paired: isPaired === 'yes',
        paired_hint: isPaired === 'not_sure' ? undefined : isPaired === 'yes',
        control_group: controlGroup || undefined,
        are_biological_replicates: isBiological === 'yes',
      },
    };
    onConfirm(updatedDataset);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Dataset Preview</CardTitle>
          <CardDescription>{dataset.filename}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Rows:</span>
              <p className="font-semibold">{dataset.n_rows}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Columns:</span>
              <p className="font-semibold">{dataset.n_columns}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Numeric:</span>
              <p className="font-semibold">{dataset.schema.candidate_y?.length || 0}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Categorical:</span>
              <p className="font-semibold">{dataset.schema.candidate_group?.length || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Are these paired observations?</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={isPaired} onValueChange={(v) => setIsPaired(v as 'yes' | 'no' | 'not_sure')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="paired-no" />
              <Label htmlFor="paired-no" className="font-normal cursor-pointer">
                No, independent samples
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="paired-yes" />
              <Label htmlFor="paired-yes" className="font-normal cursor-pointer">
                Yes, paired/matched samples
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="not_sure" id="paired-not_sure" />
              <Label htmlFor="paired-not_sure" className="font-normal cursor-pointer">
                Not sure
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {groupColumns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Control group (optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={controlGroup} onValueChange={setControlGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Select control group..." />
              </SelectTrigger>
              <SelectContent>
                {groupColumns.map((col) => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Are these biological replicates?</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={isBiological} onValueChange={(v) => setIsBiological(v as 'yes' | 'no')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="bio-yes" />
              <Label htmlFor="bio-yes" className="font-normal cursor-pointer">
                Yes, biological replicates
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="bio-no" />
              <Label htmlFor="bio-no" className="font-normal cursor-pointer">
                No, technical replicates
              </Label>
            </div>
          </RadioGroup>
          <p className="text-xs text-muted-foreground mt-2">
            This affects choice of error model and assumption checks
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleConfirm} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  );
}
