import Papa from 'papaparse';

export interface ParsedCSV {
  headers: string[];
  rows: Record<string, unknown>[];
  raw: string;
}

export async function parseCSV(content: string): Promise<ParsedCSV> {
  return new Promise((resolve, reject) => {
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<Record<string, unknown>>) => {
        if (!results.data || results.data.length === 0) {
          reject(new Error('No data found in CSV'));
          return;
        }

        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, unknown>[];

        resolve({
          headers,
          rows,
          raw: content,
        });
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}

export function getCSVHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export function getPreview(rows: Record<string, unknown>[], count: number = 50): Record<string, unknown>[] {
  return rows.slice(0, count);
}

export async function inferColumnTypes(
  headers: string[],
  rows: Record<string, unknown>[]
): Promise<
  Array<{
    name: string;
    type: 'numeric' | 'categorical' | 'text';
    non_null_count: number;
    null_count: number;
  }>
> {
  const types = headers.map((header) => {
    let numericCount = 0;
    let nullCount = 0;

    for (const row of rows) {
      const value = row[header];

      if (value === null || value === undefined || value === '') {
        nullCount++;
        continue;
      }

      const strValue = String(value).trim();
      if (!isNaN(Number(strValue)) && strValue !== '') {
        numericCount++;
      }
    }

    const isNumeric = numericCount >= rows.length * 0.8;
    const type = isNumeric ? ('numeric' as const) : ('categorical' as const);

    return {
      name: header,
      type,
      non_null_count: rows.length - nullCount,
      null_count: nullCount,
    };
  });

  return types;
}
