import { NextRequest, NextResponse } from 'next/server';
import { adoption } from '../../../../lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adoptionItem = await adoption.getById(params.id);
    if (!adoptionItem) {
      return NextResponse.json({ error: 'Adozione non trovata' }, { status: 404 });
    }
    return NextResponse.json(adoptionItem);
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
    const { startDate, endDate, isActive } = body;

    const updated = await adoption.update(params.id, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : null,
      isActive: isActive !== undefined ? isActive : undefined,
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
    await adoption.delete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Errore nell\'eliminazione' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action, endDate } = body;

    if (action === 'close') {
      const closed = await adoption.close(params.id, endDate ? new Date(endDate) : new Date());
      return NextResponse.json(closed);
    }

    return NextResponse.json({ error: 'Azione non valida' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Errore nell\'operazione' }, { status: 500 });
  }
}