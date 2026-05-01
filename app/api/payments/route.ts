import { NextRequest, NextResponse } from 'next/server';
import { payment } from '../../../lib/db';

export async function GET() {
  try {
    const payments = await payment.getAll();
    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ error: 'Errore nel recupero dei pagamenti' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      familyId,
      adoptionId,
      fundId,
      amount,
      date,
      competenceYear,
      description,
      issueReceipt,
    } = body;

    if (!familyId || !amount || !date) {
      return NextResponse.json({ error: 'Famiglia, importo e data sono obbligatori' }, { status: 400 });
    }

    const year = competenceYear || new Date(date).getFullYear();
    let receiptNumber = null;
    let receiptIssued = false;

    // Genera numero ricevuta se richiesto
    if (issueReceipt) {
      receiptNumber = await payment.getNextReceiptNumber(year);
      receiptIssued = true;
    }

    const newPayment = await payment.create({
      familyId,
      adoptionId: adoptionId || null,
      fundId: fundId || null,
      amount: parseFloat(amount),
      date: new Date(date),
      competenceYear: year,
      description: description || null,
      receiptNumber,
      receiptIssued,
    });

    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Errore nella creazione' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      familyId,
      adoptionId,
      fundId,
      amount,
      date,
      competenceYear,
      description,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID è obbligatorio' }, { status: 400 });
    }

    const updated = await payment.update(id, {
      familyId,
      adoptionId: adoptionId || null,
      fundId: fundId || null,
      amount: parseFloat(amount),
      date: new Date(date),
      competenceYear: competenceYear || new Date(date).getFullYear(),
      description: description || null,
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

    await payment.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Errore nell\'eliminazione' }, { status: 500 });
  }
}