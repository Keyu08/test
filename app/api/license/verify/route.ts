import { NextRequest, NextResponse } from 'next/server';

const DEMO_KEY = 'METHODICA-PRO-DEMO';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const licenseKey = body.license_key;

  if (!licenseKey) {
    return NextResponse.json(
      { error: 'License key required' },
      { status: 400 }
    );
  }

  const isPro = licenseKey === DEMO_KEY;

  return NextResponse.json({
    valid: true,
    is_pro: isPro,
    features: {
      svg_export: isPro,
      pdf_export: isPro,
      full_equations: isPro,
    },
  });
}
