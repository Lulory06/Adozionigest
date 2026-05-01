'use client';

import { useEffect, useMemo, useState } from 'react';

type Family = {
  id: string;
  name: string;
  surname: string;
  country: string;
  package: string;
  status?: string;
};

type Payment = {
  id: string;
  familyId: string;
  adoptionId: string | null;
  fundId: string | null;
  amount: number;
  date: string;
  competenceYear: number;
  description: string | null;
  receiptNumber: string | null;
  family?: { name: string; surname: string };
  fund?: { name: string };
};

type Fund = { id: string; name: string };

export default function ReportsPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [filterFamily, setFilterFamily] = useState('');
  const [filterFund, setFilterFund] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterCompetenceYear, setFilterCompetenceYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [familiesRes, paymentsRes, fundsRes] = await Promise.all([
        fetch('/api/families'),
        fetch('/api/payments'),
        fetch('/api/funds'),
      ]);
      if (!familiesRes.ok || !paymentsRes.ok || !fundsRes.ok) {
        throw new Error('Errore nel caricamento dei dati');
      }
      const familiesData = await familiesRes.json();
      const paymentsData = await paymentsRes.json();
      const fundsData = await fundsRes.json();
      setFamilies(familiesData);
      setPayments(paymentsData);
      setFunds(fundsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  }

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const familyMatch = !filterFamily || payment.familyId === filterFamily;
      const fundMatch = !filterFund || payment.fundId === filterFund;
      const monthMatch = !filterMonth || payment.date.includes(`-${filterMonth.padStart(2, '0')}-`);
      const yearMatch = !filterYear || new Date(payment.date).getFullYear().toString() === filterYear;
      const competenceMatch = !filterCompetenceYear || payment.competenceYear.toString() === filterCompetenceYear;
      return familyMatch && fundMatch && monthMatch && yearMatch && competenceMatch;
    });
  }, [payments, filterFamily, filterFund, filterMonth, filterYear, filterCompetenceYear]);

  const totalFiltered = useMemo(
    () => filteredPayments.reduce((sum, payment) => sum + payment.amount, 0),
    [filteredPayments]
  );

  // Raggruppa per fondo
  const groupedByFund = useMemo(() => {
    const groups: Record<string, { total: number; count: number; name: string }> = {};
    filteredPayments.forEach((payment) => {
      const fundName = payment.fund?.name || 'Senza fondo';
      if (!groups[fundName]) {
        groups[fundName] = { total: 0, count: 0, name: fundName };
      }
      groups[fundName].total += payment.amount;
      groups[fundName].count += 1;
    });
    return Object.values(groups).sort((a, b) => b.total - a.total);
  }, [filteredPayments]);

  function clearFilters() {
    setFilterFamily('');
    setFilterFund('');
    setFilterMonth('');
    setFilterYear(new Date().getFullYear().toString());
    setFilterCompetenceYear('');
  }

  function exportCSV() {
    const headers = ['Data', 'Anno Comp.', 'Famiglia', 'Fondo', 'Importo', 'Ricevuta', 'Note'];
    const rows = filteredPayments.map((p) => {
      const family = families.find((f) => f.id === p.familyId);
      return [
        new Date(p.date).toLocaleDateString('it-IT'),
        p.competenceYear,
        family ? `${family.name} ${family.surname || ''}`.trim() : '',
        p.fund?.name || '',
        p.amount.toFixed(2),
        p.receiptNumber || '',
        p.description || '',
      ].map((v) => `"${v}"`).join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_versamenti_${filterYear || 'tutti'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <main className="main">
        <section className="header">
          <h1>Estrazioni e Report</h1>
          <p>Caricamento...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main">
        <section className="header">
          <h1>Estrazioni e Report</h1>
          <p style={{ color: 'red' }}>Errore: {error}</p>
          <button onClick={loadData}>Riprova</button>
        </section>
      </main>
    );
  }

  return (
    <main className="main">
      <section className="header">
        <h1>Estrazioni e Report</h1>
        <p>Filtra e visualizza i versamenti per famiglia, fondo, mese, anno o anno di competenza.</p>
      </section>

      <section className="panel">
        <h2>Filtri</h2>
        <div className="formGroup" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          <label>
            Famiglia
            <select value={filterFamily} onChange={(event) => setFilterFamily(event.target.value)}>
              <option value="">Tutte le famiglie</option>
              {families.filter(f => f.status !== 'archived').map((family) => (
                <option key={family.id} value={family.id}>
                  {family.name} {family.surname}
                </option>
              ))}
            </select>
          </label>
          <label>
            Fondo
            <select value={filterFund} onChange={(event) => setFilterFund(event.target.value)}>
              <option value="">Tutti i fondi</option>
              {funds.map((fund) => (
                <option key={fund.id} value={fund.id}>
                  {fund.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Mese (1-12)
            <input
              type="number"
              min="1"
              max="12"
              value={filterMonth}
              onChange={(event) => setFilterMonth(event.target.value)}
              placeholder="Tutti"
            />
          </label>
          <label>
            Anno (data)
            <input
              type="number"
              min="2000"
              max="2100"
              value={filterYear}
              onChange={(event) => setFilterYear(event.target.value)}
              placeholder="Tutti"
            />
          </label>
          <label>
            Anno competenza
            <input
              type="number"
              min="2000"
              max="2100"
              value={filterCompetenceYear}
              onChange={(event) => setFilterCompetenceYear(event.target.value)}
              placeholder="Tutti"
            />
          </label>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={clearFilters} className="secondary">Cancella filtri</button>
          <button onClick={exportCSV}>Esporta CSV</button>
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

      {groupedByFund.length > 0 && (
        <section className="panel" style={{ marginTop: 24 }}>
          <h2>Riepilogo per Fondo</h2>
          <table>
            <thead>
              <tr>
                <th>Fondo</th>
                <th>Versamenti</th>
                <th>Totale</th>
              </tr>
            </thead>
            <tbody>
              {groupedByFund.map((group) => (
                <tr key={group.name}>
                  <td>{group.name}</td>
                  <td>{group.count}</td>
                  <td>€ {group.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="panel" style={{ marginTop: 24 }}>
        <h2>Risultati ({filteredPayments.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Anno Comp.</th>
              <th>Famiglia</th>
              <th>Fondo</th>
              <th>Importo</th>
              <th>Ricevuta</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => {
              const family = families.find((item) => item.id === payment.familyId);
              return (
                <tr key={payment.id}>
                  <td>{new Date(payment.date).toLocaleDateString('it-IT')}</td>
                  <td>{payment.competenceYear}</td>
                  <td>{family ? `${family.name} ${family.surname || ''}`.trim() : 'Sconosciuto'}</td>
                  <td>{payment.fund?.name || '-'}</td>
                  <td>€ {payment.amount.toFixed(2)}</td>
                  <td>{payment.receiptNumber || '-'}</td>
                  <td>{payment.description ? payment.description.substring(0, 30) + (payment.description.length > 30 ? '...' : '') : '-'}</td>
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