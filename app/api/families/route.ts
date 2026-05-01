import { NextRequest, NextResponse } from 'next/server';
import { family } from '../../../lib/db';

export async function GET() {
  try {
    const families = await family.getAll();
    return NextResponse.json(families);
  } catch (error) {
    return NextResponse.json({ error: 'Errore nel recupero delle famiglie' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type, name, surname, address, cap, city, province, region, country, package: packageType, status, postalName, notes } = body;

    if (!name || !country || !packageType) {
      return NextResponse.json({ error: 'Nome, paese e pacchetto sono obbligatori' }, { status: 400 });
    }

    const newFamily = await family.create({
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
      status: status || 'active',
      postalName: postalName || null,
      notes: notes || null,
    });

    return NextResponse.json(newFamily, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Errore nella creazione' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type, name, surname, address, cap, city, province, region, country, package: packageType, status, postalName, notes } = body;

    if (!id || !name || !country || !packageType) {
      return NextResponse.json({ error: 'ID, nome, paese e pacchetto sono obbligatori' }, { status: 400 });
    }

    const updated = await family.update(id, {
      type,
      name,
      surname,
      address,
      cap,
      city,
      province,
      region,
      country,
      package: packageType,
      status,
      postalName,
      notes,
    });

    return NextResponse.json(updated);
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

    await family.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Errore nell\'eliminazione della famiglia' }, { status: 500 });
  }
}