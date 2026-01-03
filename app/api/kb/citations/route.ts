import { NextRequest, NextResponse } from 'next/server';

const CITATIONS = {
  welch1947: {
    id: 'welch1947',
    title: "The generalization of Student's problem when several different population variances are involved",
    authors: 'Welch, B.L.',
    year: 1947,
    doi: '10.1093/biomet/34.1-2.28',
  },
  student1908: {
    id: 'student1908',
    title: 'The probable error of a mean',
    authors: 'Student',
    year: 1908,
    doi: '10.1093/biomet/6.1.1',
  },
  fisher1925: {
    id: 'fisher1925',
    title: 'Statistical Methods for Research Workers',
    authors: 'Fisher, R.A.',
    year: 1925,
  },
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ids = searchParams.get('ids')?.split(',') || [];

  const citations = ids
    .map((id) => CITATIONS[id as keyof typeof CITATIONS])
    .filter(Boolean);

  return NextResponse.json({ citations });
}
