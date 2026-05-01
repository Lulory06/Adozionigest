import { NextRequest, NextResponse } from 'next/server';
import { adopted } from '../../../lib/db';

export async function GET() {
  try {
    const adoptedList = await adopted.getAll();
    return NextResponse.json(adoptedList);
  } catch (error) {
    return NextResponse.json({ error: 'Errore nel recupero degli adottati' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, birthDate, gender, motherName, fatherName, schoolGrade, notes } = body;

    if (!name) {
      return NextResponse.json({ error: 'Il nome è obbligatorio' }, { status: 400 });
    }

    const newAdopted = await adopted.create({
      name,
      birthDate: birthDate ? new Date(birthDate) : null,
      gender: gender || null,
      motherName: motherName || null,
      fatherName: fatherName || null,
      schoolGrade: schoolGrade || null,
      notes: notes || null,
    });

    return NextResponse.json(newAdopted, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Errore nella creazione' }, { status: 500 });
  }
}