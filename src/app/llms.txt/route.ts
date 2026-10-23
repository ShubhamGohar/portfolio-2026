import { NextResponse } from 'next/server';
import { getLlmsTxt } from '@/lib/llms-txt';

export const revalidate = 60;

export async function GET() {
  const body = await getLlmsTxt();
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
