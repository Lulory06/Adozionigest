import { NextRequest, NextResponse } from 'next/server';
import { getAllFamilies, createFamily, updateFamily, deleteFamily, type Family } from '../../../lib/db';

export async function GET() {
  try {
    const families = await getAllFamilies();
    return NextResponse.json(families);
  } catch (error) {
    return NextResponse.json({ error: 'Errore nel recupero delle famiglie' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type, name, surname, address, cap, city, province, region, country, package: packageType } = body;

    if (!name || !country || !packageType) {
      return NextResponse.json({ error: 'Nome, paese e pacchetto sono obbligatori' }, { status: 400 });
    }

    const family: Omit<Family, 'createdAt' | 'updatedAt'> = {
      id: id || `fam-${Date.now()}`,
      type: type || 'famiglia',
      name,
      surname: surname || '',
      address: address || '',
      cap: cap || '',
      city: city || '',
      province: province || '',
      region: region || '',
      country,
      package: packageType,
    };

    await createFamily(family);
    return NextResponse.json(family, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Errore nella creazione' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type, name, surname, address, cap, city, province, region, country, package: packageType } = body;

    if (!id || !name || !country || !packageType) {
      return NextResponse.json({ error: 'ID, nome, paese e pacchetto sono obbligatori' }, { status: 400 });
    }

    await updateFamily(id, { type, name, surname, address, cap, city, province, region, country, package: packageType });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Errore nell\'aggiornamento' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID è obbligatorio' }, { status: 400 });
    }

    await deleteFamily(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Errore nell\'eliminazione della famiglia' }, { status: 500 });
  }
}