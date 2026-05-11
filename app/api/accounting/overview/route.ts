import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { getAccountingOverview } from '../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'mese';

    const overview = await getAccountingOverview(period);
    return NextResponse.json(overview);
  } catch (error) {
    console.error('Errore nel recupero overview contabile:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}