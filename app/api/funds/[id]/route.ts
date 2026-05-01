import { NextRequest, NextResponse } from 'next/server';
import { fund } from '../../../../lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fundItem = await fund.getById(params.id);
    if (!fundItem) {
      return NextResponse.json({ error: 'Fondo non trovato' }, { status: 404 });
    }
    return NextResponse.json(fundItem);
  } catch (error) {
    return NextResponse.json({ error: 'Errore nel recupero' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description } = body;

    const updated = await fund.update(params.id, {
      name,
      description: description || null,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Errore nell\'aggiornamento' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await fund.delete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Errore nell\'eliminazione' }, { status: 500 });
  }
}