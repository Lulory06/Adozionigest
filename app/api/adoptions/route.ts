import { NextRequest, NextResponse } from 'next/server';
import { adoption, adopted } from '../../../lib/db';

export async function GET() {
  try {
    const adoptions = await adoption.getAll();
    return NextResponse.json(adoptions);
  } catch (error) {
    return NextResponse.json({ error: 'Errore nel recupero delle adozioni' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { familyId, adoptedId, startDate, endDate } = body;

    if (!familyId || !adoptedId || !startDate) {
      return NextResponse.json({ error: 'Famiglia, adottato e data inizio sono obbligatori' }, { status: 400 });
    }

    // Verifica che l'adottato non abbia già un'adozione attiva
    const hasActive = await adopted.getById(adoptedId);
    if (!hasActive) {
      return NextResponse.json({ error: 'Adottato non trovato' }, { status: 404 });
    }

    const activeAdoption = await adoption.hasActive(adoptedId);
    if (activeAdoption) {
      return NextResponse.json({ error: "L'adottato ha già un'adozione attiva" }, { status: 400 });
    }

    const newAdoption = await adoption.create({
      familyId,
      adoptedId,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      isActive: !endDate,
    });

    return NextResponse.json(newAdoption, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Errore nella creazione' }, { status: 500 });
  }
}