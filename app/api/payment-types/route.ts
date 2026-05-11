import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { paymentType } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const types = await paymentType.getAllIncludingInactive();
    return NextResponse.json(types);
  } catch (error) {
    console.error('Errore nel recupero tipi di pagamento:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, isActive = true } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Nome tipo di pagamento obbligatorio' }, { status: 400 });
    }

    // Verifica unicità del nome
    const existing = await paymentType.getAllIncludingInactive();
    if (existing.some((type: any) => type.name.toLowerCase() === name.toLowerCase().trim())) {
      return NextResponse.json({ error: 'Nome tipo di pagamento già esistente' }, { status: 400 });
    }

    const newType = await paymentType.create({
      name: name.trim(),
      description: description?.trim() || null,
      isActive
    });

    return NextResponse.json(newType, { status: 201 });
  } catch (error) {
    console.error('Errore nella creazione tipo di pagamento:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description, isActive } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'ID tipo di pagamento obbligatorio' }, { status: 400 });
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Nome tipo di pagamento obbligatorio' }, { status: 400 });
    }

    // Verifica unicità del nome (escludendo il tipo corrente)
    const existing = await paymentType.getAllIncludingInactive();
    if (existing.some((type: any) => type.id !== id && type.name.toLowerCase() === name.toLowerCase().trim())) {
      return NextResponse.json({ error: 'Nome tipo di pagamento già esistente' }, { status: 400 });
    }

    const updatedType = await paymentType.update(id, {
      name: name.trim(),
      description: description?.trim() || null,
      isActive
    });

    return NextResponse.json(updatedType);
  } catch (error) {
    console.error('Errore nell\'aggiornamento tipo di pagamento:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}