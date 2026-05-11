import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { incomeCategory } from '../../../../lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const categories = await incomeCategory.getAllIncludingInactive();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Errore nel recupero categorie entrate:', error);
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
      return NextResponse.json({ error: 'Nome categoria obbligatorio' }, { status: 400 });
    }

    // Verifica unicità del nome
    const existing = await incomeCategory.getAllIncludingInactive();
    if (existing.some((cat: any) => cat.name.toLowerCase() === name.toLowerCase().trim())) {
      return NextResponse.json({ error: 'Nome categoria già esistente' }, { status: 400 });
    }

    const category = await incomeCategory.create({
      name: name.trim(),
      description: description?.trim() || null,
      isActive
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Errore nella creazione categoria entrata:', error);
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
      return NextResponse.json({ error: 'ID categoria obbligatorio' }, { status: 400 });
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Nome categoria obbligatorio' }, { status: 400 });
    }

    // Verifica unicità del nome (escludendo la categoria corrente)
    const existing = await incomeCategory.getAllIncludingInactive();
    if (existing.some((cat: any) => cat.id !== id && cat.name.toLowerCase() === name.toLowerCase().trim())) {
      return NextResponse.json({ error: 'Nome categoria già esistente' }, { status: 400 });
    }

    const category = await incomeCategory.update(id, {
      name: name.trim(),
      description: description?.trim() || null,
      isActive
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Errore nell\'aggiornamento categoria entrata:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}