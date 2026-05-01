import { NextResponse } from 'next/server';
import { getStatistics } from '../../../lib/db';

export async function GET() {
  try {
    const stats = await getStatistics();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Errore nel recupero delle statistiche' }, { status: 500 });
  }
}