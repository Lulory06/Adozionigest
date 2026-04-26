'use client';

import { useEffect, useMemo, useState } from 'react';

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

export default function ReportsPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filterFamily, setFilterFamily] = useState('');
  const [filterDay, setFilterDay] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  }

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const familyMatch = !filterFamily || payment.familyId === filterFamily;
      const dayMatch = !filterDay || payment.date.endsWith(`-${filterDay.padStart(2, '0')}`);
      const monthMatch = !filterMonth || payment.date.includes(`-${filterMonth.padStart(2, '0')}-`);
      const yearMatch = !filterYear || payment.date.startsWith(filterYear);
      return familyMatch && dayMatch && monthMatch && yearMatch;
    });
  }, [payments, filterFamily, filterDay, filterMonth, filterYear]);

  const totalFiltered = useMemo(
    () => filteredPayments.reduce((sum, payment) => sum + payment.amount, 0),
    [filteredPayments]
  );

  function clearFilters() {
    setFilterFamily('');
    setFilterDay('');
    setFilterMonth('');
    setFilterYear('');
  }

  if (loading) {
    return (
      <main className="main">
        <section className="header">
          <h1>Estrazioni Pagamenti</h1>
          <p>Caricamento...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main">
        <section className="header">
          <h1>Estrazioni Pagamenti</h1>
          <p style={{ color: 'red' }}>Errore: {error}</p>
          <button onClick={loadData}>Riprova</button>
        </section>
      </main>
    );
  }

  return (
    <main className="main">
      <section className="header">
        <h1>Estrazioni Pagamenti</h1>
        <p>Filtra e visualizza i versamenti per famiglia, giorno, mese o anno.</p>
      </section>

      <section className="panel">
        <h2>Filtri</h2>
        <div className="formGroup" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <label>
            Famiglia
            <select value={filterFamily} onChange={(event) => setFilterFamily(event.target.value)}>
              <option value="">Tutte le famiglie</option>
              {families.map((family) => (
                <option key={family.id} value={family.id}>
                  {family.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Giorno (1-31)
            <input
              type="number"
              min="1"
              max="31"
              value={filterDay}
              onChange={(event) => setFilterDay(event.target.value)}
              placeholder="Es. 15"
            />
          </label>
          <label>
            Mese (1-12)
            <input
              type="number"
              min="1"
              max="12"
              value={filterMonth}
              onChange={(event) => setFilterMonth(event.target.value)}
              placeholder="Es. 4"
            />
          </label>
          <label>
            Anno
            <input
              type="number"
              min="2000"
              max="2100"
              value={filterYear}
              onChange={(event) => setFilterYear(event.target.value)}
              placeholder="Es. 2026"
            />
          </label>
        </div>
        <div style={{ marginTop: 16 }}>
          <button onClick={clearFilters} className="secondary">Cancella filtri</button>
        </div>
      </section>

      <section className="summary" style={{ marginTop: 24 }}>
        <div className="summary-card">
          <h3>Versamenti filtrati</h3>
          <p>{filteredPayments.length}</p>
        </div>
        <div className="summary-card">
          <h3>Totale filtrato</h3>
          <p>€ {totalFiltered.toFixed(2)}</p>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 24 }}>
        <h2>Risultati ({filteredPayments.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Famiglia</th>
              <th>Importo</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => {
              const family = families.find((item) => item.id === payment.familyId);
              return (
                <tr key={payment.id}>
                  <td>{payment.date}</td>
                  <td>{family?.name ?? 'Famiglia non trovata'}</td>
                  <td>€ {payment.amount.toFixed(2)}</td>
                  <td>{payment.note || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredPayments.length === 0 && (
          <p style={{ textAlign: 'center', marginTop: 24, color: '#64748b' }}>
            Nessun versamento trovato con i filtri selezionati.
          </p>
        )}
      </section>

      <section className="panel" style={{ marginTop: 24 }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <button className="secondary">Torna alla Dashboard</button>
        </a>
      </section>
    </main>
  );
}