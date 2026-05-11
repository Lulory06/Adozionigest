import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { transaction } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'ENTRATA' | 'USCITA' | null;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const categoryId = searchParams.get('categoryId');
    const familyId = searchParams.get('familyId');

    const filters: any = {};
    if (type) filters.type = type;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (categoryId) filters.categoryId = categoryId;
    if (familyId) filters.familyId = familyId;

    const transactions = await transaction.getAll(filters);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Errore nel recupero transazioni:', error);
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
    const {
      type,
      amount,
      date,
      description,
      incomeCategoryId,
      expenseCategoryId,
      familyId,
      paymentMethod,
      documentNumber,
      notes
    } = body;

    // Validazioni
    if (!type || !['ENTRATA', 'USCITA'].includes(type)) {
      return NextResponse.json({ error: 'Tipo transazione obbligatorio (ENTRATA/USCITA)' }, { status: 400 });
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Importo obbligatorio e deve essere positivo' }, { status: 400 });
    }

    if (!date) {
      return NextResponse.json({ error: 'Data obbligatoria' }, { status: 400 });
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json({ error: 'Descrizione obbligatoria' }, { status: 400 });
    }

    // Validazione categorie
    if (type === 'ENTRATA' && !incomeCategoryId) {
      return NextResponse.json({ error: 'Categoria entrata obbligatoria per transazioni di entrata' }, { status: 400 });
    }

    if (type === 'USCITA' && !expenseCategoryId) {
      return NextResponse.json({ error: 'Categoria uscita obbligatoria per transazioni di uscita' }, { status: 400 });
    }

    const newTransaction = await transaction.create({
      type,
      amount,
      date: new Date(date),
      description: description.trim(),
      incomeCategoryId: type === 'ENTRATA' ? incomeCategoryId : undefined,
      expenseCategoryId: type === 'USCITA' ? expenseCategoryId : undefined,
      familyId: familyId || undefined,
      paymentMethod,
      documentNumber: documentNumber?.trim() || undefined,
      notes: notes?.trim() || undefined
      // userId: session.user.id // TODO: implementare quando disponibile
    });

    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error('Errore nella creazione transazione:', error);
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
    const {
      id,
      type,
      amount,
      date,
      description,
      incomeCategoryId,
      expenseCategoryId,
      familyId,
      paymentMethod,
      documentNumber,
      notes
    } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'ID transazione obbligatorio' }, { status: 400 });
    }

    // Validazioni
    if (type && !['ENTRATA', 'USCITA'].includes(type)) {
      return NextResponse.json({ error: 'Tipo transazione non valido' }, { status: 400 });
    }

    if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
      return NextResponse.json({ error: 'Importo deve essere positivo' }, { status: 400 });
    }

    if (description !== undefined && (typeof description !== 'string' || description.trim().length === 0)) {
      return NextResponse.json({ error: 'Descrizione non può essere vuota' }, { status: 400 });
    }

    // Validazione categorie
    if (type === 'ENTRATA' && !incomeCategoryId) {
      return NextResponse.json({ error: 'Categoria entrata obbligatoria per transazioni di entrata' }, { status: 400 });
    }

    if (type === 'USCITA' && !expenseCategoryId) {
      return NextResponse.json({ error: 'Categoria uscita obbligatoria per transazioni di uscita' }, { status: 400 });
    }

    const updateData: any = {};
    if (type) updateData.type = type;
    if (amount !== undefined) updateData.amount = amount;
    if (date) updateData.date = new Date(date);
    if (description !== undefined) updateData.description = description.trim();
    if (incomeCategoryId !== undefined) updateData.incomeCategoryId = incomeCategoryId;
    if (expenseCategoryId !== undefined) updateData.expenseCategoryId = expenseCategoryId;
    if (familyId !== undefined) updateData.familyId = familyId;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (documentNumber !== undefined) updateData.documentNumber = documentNumber?.trim() || null;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;

    const updatedTransaction = await transaction.update(id, updateData);
    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error('Errore nell\'aggiornamento transazione:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'ID transazione obbligatorio' }, { status: 400 });
    }

    await transaction.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore nell\'eliminazione transazione:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}