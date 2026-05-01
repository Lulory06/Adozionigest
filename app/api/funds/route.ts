import { NextRequest, NextResponse } from 'next/server';
import { fund } from '../../../lib/db';

export async function GET() {
  try {
    const funds = await fund.getAll();
    return NextResponse.json(funds);
  } catch (error) {
    return NextResponse.json({ error: 'Errore nel recupero dei fondi' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Il nome è obbligatorio' }, { status: 400 });
    }

    const newFund = await fund.create({
      name,
      description: description || null,
    });

    return NextResponse.json(newFund, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Errore nella creazione' }, { status: 500 });
  }
}