'use client';

import { useEffect, useState } from 'react';

type Family = {
  id: string;
  name: string;
  country: string;
  package: string;
};

type Payment = {
  id: string;
  familyId: string;
  amount: number;
  date: string;
  note: string;
};

export default function PaymentsPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentFamily, setPaymentFamily] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [editPaymentId, setEditPaymentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [familiesRes, paymentsRes] = await Promise.all([
        fetch('/api/families'),
        fetch('/api/payments'),
      ]);
      if (!familiesRes.ok || !paymentsRes.ok) {
        throw new Error('Errore nel caricamento dei dati');
      }
      const familiesData = await familiesRes.json();
      const paymentsData = await paymentsRes.json();
      setFamilies(familiesData);
      setPayments(paymentsData);
      if (familiesData.length > 0) {
        setPaymentFamily(familiesData[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  }

  async function addPayment(event: React.FormEvent) {
    event.preventDefault();
    if (!paymentAmount || !paymentFamily || Number(paymentAmount) <= 0) return;

    const newPayment: Omit<Payment, 'id'> = {
      familyId: paymentFamily,
      amount: Number(paymentAmount),
      date: paymentDate || new Date().toISOString().slice(0, 10),
      note: paymentNote.trim(),
    };

    try {
      const method = editPaymentId ? 'PUT' : 'POST';
      const url = '/api/payments';
      const body = editPaymentId ? { ...newPayment, id: editPaymentId } : newPayment;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error('Errore nel salvataggio del pagamento');
      }

      setEditPaymentId(null);
      setPaymentAmount('');
      setPaymentDate('');
      setPaymentNote('');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel salvataggio');
    }
  }

  function startEditPayment(payment: Payment) {
    setEditPaymentId(payment.id);
    setPaymentFamily(payment.familyId);
    setPaymentAmount(payment.amount.toString());
    setPaymentDate(payment.date);
    setPaymentNote(payment.note);
  }

  function cancelEditPayment() {
    setEditPaymentId(null);
    setPaymentAmount('');
    setPaymentDate('');
    setPaymentNote('');
  }

  async function deletePayment(id: string) {
    try {
      const res = await fetch(`/api/payments?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Errore nell\'eliminazione del pagamento');
      }
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'eliminazione');
    }
  }

  if (loading) {
    return (
      <main className="main">
        <section className="header">
          <h1>Gestione Pagamenti</h1>
          <p>Caricamento...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main">
        <section className="header">
          <h1>Gestione Pagamenti</h1>
          <p style={{ color: 'red' }}>Errore: {error}</p>
          <button onClick={loadData}>Riprova</button>
        </section>
      </main>
    );
  }

  return (
    <main className="main">
      <section className="header">
        <h1>Gestione Pagamenti</h1>
        <p>Registra, modifica o elimina i versamenti per le famiglie.</p>
      </section>

      <section className="panel">
        <h2>{editPaymentId ? 'Modifica versamento' : 'Nuovo versamento'}</h2>
        <form onSubmit={addPayment} className="formGroup">
          <label>
            Famiglia
            <select
              value={paymentFamily}
              onChange={(event) => setPaymentFamily(event.target.value)}
              required
            >
              <option value="">Seleziona famiglia</option>
              {families.map((family) => (
                <option key={family.id} value={family.id}>
                  {family.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Importo (€)
            <input
              type="number"
              min="1"
              step="0.01"
              value={paymentAmount}
              onChange={(event) => setPaymentAmount(event.target.value)}
              placeholder="0.00"
              required
            />
          </label>
          <label>
            Data
            <input
              type="date"
              value={paymentDate}
              onChange={(event) => setPaymentDate(event.target.value)}
              required
            />
          </label>
          <label>
            Note
            <textarea
              rows={3}
              value={paymentNote}
              onChange={(event) => setPaymentNote(event.target.value)}
              placeholder="Es. Donazione mensile"
            />
          </label>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="submit">
              {editPaymentId ? 'Salva modifiche' : 'Registra versamento'}
            </button>
            {editPaymentId ? (
              <button type="button" className="secondary" onClick={cancelEditPayment}>
                Annulla
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="panel" style={{ marginTop: 24 }}>
        <h2>Storico versamenti ({payments.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Famiglia</th>
              <th>Importo</th>
              <th>Note</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => {
              const family = families.find((item) => item.id === payment.familyId);
              return (
                <tr key={payment.id}>
                  <td>{payment.date}</td>
                  <td>{family?.name ?? 'Famiglia non trovata'}</td>
                  <td>€ {payment.amount.toFixed(2)}</td>
                  <td>{payment.note || '-'}</td>
                  <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => startEditPayment(payment)}>
                      Modifica
                    </button>
                    <button type="button" className="secondary" onClick={() => deletePayment(payment.id)}>
                      Elimina
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="panel" style={{ marginTop: 24 }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <button className="secondary">Torna alla Dashboard</button>
        </a>
      </section>
    </main>
  );
}