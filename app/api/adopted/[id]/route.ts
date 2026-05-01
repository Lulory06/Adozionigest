import { NextRequest, NextResponse } from 'next/server';
import { adopted } from '../../../../lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adoptedItem = await adopted.getById(params.id);
    if (!adoptedItem) {
      return NextResponse.json({ error: 'Adottato non trovato' }, { status: 404 });
    }
    return NextResponse.json(adoptedItem);
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
    const { name, birthDate, gender, motherName, fatherName, schoolGrade, notes } = body;

    const updated = await adopted.update(params.id, {
      name,
      birthDate: birthDate ? new Date(birthDate) : null,
      gender: gender || null,
      motherName: motherName || null,
      fatherName: fatherName || null,
      schoolGrade: schoolGrade || null,
      notes: notes || null,
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
    await adopted.delete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Errore nell\'eliminazione' }, { status: 500 });
  }
}