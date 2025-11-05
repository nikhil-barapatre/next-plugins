// app/api/customers/stats/route.ts
import { NextResponse } from 'next/server';
import { getCustomerStats } from '@/lib/server/customers';

export async function GET() {
  try {
    const stats = await getCustomerStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('[CUSTOMER_STATS_GET]', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
