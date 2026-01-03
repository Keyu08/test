'use client';

import { useEffect, useRef, useState } from 'react';
import vegaEmbed from 'vega-embed';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertCircle, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VegaFigureProps {
  spec: Record<string, unknown>;
  title?: string;
  onExport?: (format: 'png' | 'svg' | 'pdf') => void;
  isProUser?: boolean;
}

export function VegaFigure({ spec, title, onExport, isProUser = false }: VegaFigureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPoints, setShowPoints] = useState(true);
  const [errorBars, setErrorBars] = useState(true);
  const [logX, setLogX] = useState(false);
  const [logY, setLogY] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !spec) return;

    let modifiedSpec = JSON.parse(JSON.stringify(spec));

    if (logX && modifiedSpec.encoding?.x) {
      modifiedSpec.encoding.x.scale = { type: 'log' };
    }
    if (logY && modifiedSpec.encoding?.y) {
      modifiedSpec.encoding.y.scale = { type: 'log' };
    }

    vegaEmbed(containerRef.current, modifiedSpec).catch((err) => {
      setError(err.message || 'Failed to render plot');
    });
  }, [spec, logX, logY]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title || 'Figure'}</CardTitle>
          </div>
          <div className="flex gap-2">
            {isProUser && (
              <>
                <Button variant="outline" size="sm" onClick={() => onExport?.('png')}>
                  <Download className="h-4 w-4 mr-1" />
                  PNG
                </Button>
                <Button variant="outline" size="sm" onClick={() => onExport?.('svg')}>
                  <Download className="h-4 w-4 mr-1" />
                  SVG
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div ref={containerRef} className="bg-white p-4 rounded-lg border" />

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="show-points" checked={showPoints} onCheckedChange={(c) => setShowPoints(!!c)} />
            <Label htmlFor="show-points" className="font-normal cursor-pointer text-sm">
              Show points
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="error-bars" checked={errorBars} onCheckedChange={(c) => setErrorBars(!!c)} />
            <Label htmlFor="error-bars" className="font-normal cursor-pointer text-sm">
              Error bars
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="log-x" checked={logX} onCheckedChange={(c) => setLogX(!!c)} />
            <Label htmlFor="log-x" className="font-normal cursor-pointer text-sm">
              Log scale X
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="log-y" checked={logY} onCheckedChange={(c) => setLogY(!!c)} />
            <Label htmlFor="log-y" className="font-normal cursor-pointer text-sm">
              Log scale Y
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
