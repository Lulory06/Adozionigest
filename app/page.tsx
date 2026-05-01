'use client';

import { useEffect, useMemo, useState } from 'react';

type Family = {
  id: string;
  name: string;
  country: string;
  package: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
};

type Payment = {
  id: string;
  familyId: string;
  amount: number;
  date: string;
  competenceYear: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

type Statistics = {
  totalFamilies: number;
  activeFamilies: number;
  totalAdopted: number;
  activeAdoptions: number;
  totalPayments: number;
  paymentsThisYear: number;
};

export default function Home() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [familiesRes, paymentsRes] = await Promise.all([
        fetch('/api/families'),
        fetch('/api/payments'),
      ]);

      if (familiesRes.ok && paymentsRes.ok) {
        const familiesData = await familiesRes.json();
        const paymentsData = await paymentsRes.json();
        setFamilies(familiesData);
        setPayments(paymentsData);

        // Calcola statistiche
        const currentYear = new Date().getFullYear();
        const activeFamilies = familiesData.filter((f: Family) => f.status !== 'archived').length;
        const paymentsThisYear = paymentsData
          .filter((p: Payment) => p.competenceYear === currentYear)
          .reduce((sum: number, p: Payment) => sum + p.amount, 0);
        const totalPayments = paymentsData.reduce((sum: number, p: Payment) => sum + p.amount, 0);

        setStats({
          totalFamilies: familiesData.length,
          activeFamilies,
          totalAdopted: 0, // Da implementare con API dedicata
          activeAdoptions: 0, // Da implementare con API dedicata
          totalPayments,
          paymentsThisYear,
        });
      }
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalAmount = useMemo(
    () => payments.reduce((sum, payment) => sum + payment.amount, 0),
    [payments]
  );

  const recentPayments = useMemo(() => {
    return payments
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [payments]);

  if (loading) {
    return (
      <main className="main">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Caricamento...
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <section className="header">
        <h1>Dashboard Adozioni a distanza</h1>
        <p>Riassunto generale delle famiglie, adottati, adozioni e versamenti.</p>
      </section>

      <section className="summary">
        <div className="summary-card">
          <h3>Famiglie registrate</h3>
          <p>{stats?.totalFamilies || families.length}</p>
        </div>
        <div className="summary-card">
          <h3>Famiglie attive</h3>
          <p>{stats?.activeFamilies || families.filter(f => f.status !== 'archived').length}</p>
        </div>
        <div className="summary-card">
          <h3>Versamenti totali</h3>
          <p>€ {totalAmount.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Versamenti anno corrente</h3>
          <p>€ {(stats?.paymentsThisYear || 0).toFixed(2)}</p>
        </div>
      </section>

      <div className="grid">
        <section className="panel">
          <h2>Famiglie con più versamenti</h2>
          <table>
            <thead>
              <tr>
                <th>Famiglia</th>
                <th>Totale versato</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const familiesWithTotals = families.map((family) => {
                  const total = payments
                    .filter((payment) => payment.familyId === family.id)
                    .reduce((sum, payment) => sum + payment.amount, 0);
                  return { family, total };
                });
                return familiesWithTotals
                  .sort((a, b) => b.total - a.total)
                  .slice(0, 5)
                  .map(({ family, total }) => (
                    <tr key={family.id}>
                      <td>{family.name}</td>
                      <td>€ {total.toFixed(2)}</td>
                    </tr>
                  ));
              })()}
            </tbody>
          </table>
        </section>

        <section className="panel">
          <h2>Ultimi versamenti</h2>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Famiglia</th>
                <th>Importo</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((payment) => {
                const family = families.find((item) => item.id === payment.familyId);
                return (
                  <tr key={payment.id}>
                    <td>{new Date(payment.date).toLocaleDateString('it-IT')}</td>
                    <td>{family?.name ?? 'Famiglia non trovata'}</td>
                    <td>€ {payment.amount.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 24 }}>
        <h2>Navigazione</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="/families" style={{ textDecoration: 'none' }}>
            <button>Gestisci Famiglie</button>
          </a>
          <a href="/adopted" style={{ textDecoration: 'none' }}>
            <button>Gestisci Adottati</button>
          </a>
          <a href="/adoptions" style={{ textDecoration: 'none' }}>
            <button>Gestisci Adozioni</button>
          </a>
          <a href="/payments" style={{ textDecoration: 'none' }}>
            <button>Gestisci Pagamenti</button>
          </a>
          <a href="/funds" style={{ textDecoration: 'none' }}>
            <button>Gestisci Fondi</button>
          </a>
          <a href="/reports" style={{ textDecoration: 'none' }}>
            <button>Estrazioni e Report</button>
          </a>
        </div>
      </section>
    </main>
  );
}