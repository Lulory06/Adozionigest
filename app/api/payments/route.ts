import { NextRequest, NextResponse } from 'next/server';
import { getAllPayments, createPayment, updatePayment, deletePayment, type Payment } from '../../../lib/db';

export async function GET() {
  try {
    const payments = await getAllPayments();
    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ error: 'Errore nel recupero dei pagamenti' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, familyId, amount, date, note } = body;

    if (!familyId || !amount || !date) {
      return NextResponse.json({ error: 'Famiglia, importo e data sono obbligatori' }, { status: 400 });
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Importo deve essere un numero positivo' }, { status: 400 });
    }

    const payment: Omit<Payment, 'createdAt' | 'updatedAt'> = {
      id: id || `pay-${Date.now()}`,
      familyId,
      amount: Number(amount),
      date,
      note: note || null,
    };

    await createPayment(payment);
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Errore nella creazione del pagamento' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, familyId, amount, date, note } = body;

    if (!id || !familyId || !amount || !date) {
      return NextResponse.json({ error: 'ID, famiglia, importo e data sono obbligatori' }, { status: 400 });
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Importo deve essere un numero positivo' }, { status: 400 });
    }

    await updatePayment(id, {
      familyId,
      amount: Number(amount),
      date,
      note: note || null,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Errore nell\'aggiornamento del pagamento' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID è obbligatorio' }, { status: 400 });
    }

    await deletePayment(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Errore nell\'eliminazione del pagamento' }, { status: 500 });
  }
}