import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Mock deterministic response based on input
  const mockResponse = {
    description: body.description || 'Analysis of dataset',
    analysis_type: body.analysis_type || 'two_group_comparison',
    x_column: body.x_column,
    y_column: body.y_column,
    group_column: body.group_column,
    context: body.context || 'biology',
  };

  return NextResponse.json(mockResponse);
}
