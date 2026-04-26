'use client';

import { useEffect, useState } from 'react';

type Family = {
  id: string;
  name: string;
  country: string;
  package: string;
  createdAt: string;
  updatedAt: string;
};

type Payment = {
  id: string;
  familyId: string;
  amount: number;
  date: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function FamiliesPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [familyName, setFamilyName] = useState('');
  const [familyCountry, setFamilyCountry] = useState('Italia');
  const [familyPackage, setFamilyPackage] = useState('Base');
  const [editFamilyId, setEditFamilyId] = useState<string | null>(null);
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
      }
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addFamily(event: React.FormEvent) {
    event.preventDefault();
    if (!familyName.trim()) return;

    const method = editFamilyId ? 'PUT' : 'POST';
    const body = editFamilyId
      ? { id: editFamilyId, name: familyName.trim(), country: familyCountry, package: familyPackage }
      : { name: familyName.trim(), country: familyCountry, package: familyPackage };

    try {
      const response = await fetch('/api/families', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await loadData();
        setFamilyName('');
        setFamilyCountry('Italia');
        setFamilyPackage('Base');
        setEditFamilyId(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Errore nell\'operazione');
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore nell\'operazione');
    }
  }

  function startEditFamily(family: Family) {
    setEditFamilyId(family.id);
    setFamilyName(family.name);
    setFamilyCountry(family.country);
    setFamilyPackage(family.package);
  }

  function cancelEditFamily() {
    setEditFamilyId(null);
    setFamilyName('');
    setFamilyCountry('Italia');
    setFamilyPackage('Base');
  }

  async function deleteFamily(id: string) {
    if (!confirm('Sei sicuro di voler eliminare questa famiglia? Verranno eliminati anche tutti i pagamenti associati.')) {
      return;
    }

    try {
      const response = await fetch(`/api/families?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadData();
      } else {
        const error = await response.json();
        alert(error.error || 'Errore nell\'eliminazione');
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore nell\'eliminazione');
    }
  }

  const familiesWithTotals = families.map((family) => {
    const total = payments
      .filter((payment) => payment.familyId === family.id)
      .reduce((sum, payment) => sum + payment.amount, 0);
    return { family, total };
  });

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
        <h1>Gestione Famiglie</h1>
        <p>Aggiungi, modifica o elimina le famiglie adottate.</p>
      </section>

      <section className="panel">
        <h2>{editFamilyId ? 'Modifica famiglia' : 'Nuova famiglia'}</h2>
        <form onSubmit={addFamily} className="formGroup">
          <label>
            Nome famiglia
            <input
              value={familyName}
              onChange={(event) => setFamilyName(event.target.value)}
              placeholder="Es. Famiglia Bianchi"
              required
            />
          </label>
          <label>
            Paese
            <input
              value={familyCountry}
              onChange={(event) => setFamilyCountry(event.target.value)}
              placeholder="Es. Italia"
              required
            />
          </label>
          <label>
            Pacchetto di adozione
            <select value={familyPackage} onChange={(event) => setFamilyPackage(event.target.value)}>
              <option>Base</option>
              <option>Standard</option>
              <option>Premium</option>
            </select>
          </label>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="submit">
              {editFamilyId ? 'Salva modifiche' : 'Aggiungi famiglia'}
            </button>
            {editFamilyId ? (
              <button type="button" className="secondary" onClick={cancelEditFamily}>
                Annulla
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="panel" style={{ marginTop: 24 }}>
        <h2>Elenco famiglie ({families.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Famiglia</th>
              <th>Paese</th>
              <th>Pacchetto</th>
              <th>Totale versato</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {familiesWithTotals.map(({ family, total }) => (
              <tr key={family.id}>
                <td>{family.name}</td>
                <td>{family.country}</td>
                <td>{family.package}</td>
                <td>€ {total.toFixed(2)}</td>
                <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => startEditFamily(family)}>
                    Modifica
                  </button>
                  <button type="button" className="secondary" onClick={() => deleteFamily(family.id)}>
                    Elimina
                  </button>
                </td>
              </tr>
            ))}
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