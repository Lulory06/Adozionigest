'use client';

import { useEffect, useState } from 'react';

type Family = {
  id: string;
  type: string;
  name: string;
  surname: string;
  address: string;
  city: string;
  cap: string;
  province: string;
  region: string;
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
  // Form fields
  const [familyType, setFamilyType] = useState<'persona' | 'famiglia'>('famiglia');
  const [familyName, setFamilyName] = useState('');
  const [familySurname, setFamilySurname] = useState('');
  const [familyAddress, setFamilyAddress] = useState('');
  const [familyCap, setFamilyCap] = useState('');
  const [familyCity, setFamilyCity] = useState('');
  const [familyProvince, setFamilyProvince] = useState('');
  const [familyRegion, setFamilyRegion] = useState('');
  const [familyCountry, setFamilyCountry] = useState('Italia');
  const [familyPackage, setFamilyPackage] = useState('Classe');  
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
      ? { 
          id: editFamilyId, 
          type: familyType,
          name: familyName.trim(), 
          surname: familySurname.trim(),
          address: familyAddress.trim(),
          cap: familyCap.trim(),
          city: familyCity.trim(),
          province: familyProvince.trim(),
          region: familyRegion.trim(),
          country: familyCountry, 
          package: familyPackage 
        }
      : { 
          type: familyType,
          name: familyName.trim(), 
          surname: familySurname.trim(),
          address: familyAddress.trim(),
          cap: familyCap.trim(),
          city: familyCity.trim(),
          province: familyProvince.trim(),
          region: familyRegion.trim(),
          country: familyCountry, 
          package: familyPackage 
        };

    try {
      const response = await fetch('/api/families', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await loadData();
        resetForm();
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
    setFamilyType(family.type as 'persona' | 'famiglia');
    setFamilyName(family.name);
    setFamilySurname(family.surname || '');
    setFamilyAddress(family.address || '');
    setFamilyCap(family.cap || '');
    setFamilyCity(family.city || '');
    setFamilyProvince(family.province || '');
    setFamilyRegion(family.region || '');
    setFamilyCountry(family.country);
    setFamilyPackage(family.package);
  }

  function resetForm() {
    setFamilyType('famiglia');
    setFamilyName('');
    setFamilySurname('');
    setFamilyAddress('');
    setFamilyCap('');
    setFamilyCity('');
    setFamilyProvince('');
    setFamilyRegion('');
    setFamilyCountry('Italia');
    setFamilyPackage('Classe');
    setEditFamilyId(null);
  }

  function cancelEditFamily() {
    resetForm();
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
        <h1>Gestione Adozioni</h1>
        <p>Aggiungi, modifica o elimina le famiglie adottate.</p>
      </section>

      <section className="panel">
        <h2>{editFamilyId ? 'Modifica' : 'Nuova'} adozione</h2>
        <form onSubmit={addFamily} className="formGroup">
          {/* Tipo: Persona o Famiglia */}
          <label>
            Tipo
            <select value={familyType} onChange={(e) => setFamilyType(e.target.value as 'persona' | 'famiglia')}>
              <option value="famiglia">Famiglia</option>
              <option value="persona">Persona singola</option>
            </select>
          </label>

          {/* Nome e Cognome */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              {familyType === 'famiglia' ? 'Nome famiglia' : 'Nome'}
              <input
                value={familyName}
                onChange={(event) => setFamilyName(event.target.value)}
                placeholder={familyType === 'famiglia' ? 'Es. Famiglia Bianchi' : 'Es. Mario'}
                required
              />
            </label>
            <label>
              Cognome
              <input
                value={familySurname}
                onChange={(event) => setFamilySurname(event.target.value)}
                placeholder="Es. Rossi"
              />
            </label>
          </div>

          {/* Indirizzo */}
          <label>
            Indirizzo di abitazione
            <input
              value={familyAddress}
              onChange={(event) => setFamilyAddress(event.target.value)}
              placeholder="Es. Via Roma 123"
            />
          </label>

          {/* CAP, Città, Provincia */}
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 100px', gap: 12 }}>
            <label>
              CAP
              <input
                value={familyCap}
                onChange={(event) => setFamilyCap(event.target.value)}
                placeholder="00100"
              />
            </label>
            <label>
              Città
              <input
                value={familyCity}
                onChange={(event) => setFamilyCity(event.target.value)}
                placeholder="Es. Roma"
              />
            </label>
            <label>
              Provincia
              <input
                value={familyProvince}
                onChange={(event) => setFamilyProvince(event.target.value)}
                placeholder="Es. RM"
              />
            </label>
          </div>

          {/* Regione e Stato */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              Regione
              <input
                value={familyRegion}
                onChange={(event) => setFamilyRegion(event.target.value)}
                placeholder="Es. Lazio"
              />
            </label>
            <label>
              Stato
              <input
                value={familyCountry}
                onChange={(event) => setFamilyCountry(event.target.value)}
                placeholder="Es. Italia"
                required
              />
            </label>
          </div>

          {/* Pacchetto adozione */}
          <label>
            Pacchetto di adozione
            <select value={familyPackage} onChange={(event) => setFamilyPackage(event.target.value)}>
              <option value="Classe">Classe</option>
              <option value="bambino singolo">bambino singolo</option>
            </select>
          </label>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="submit">
              {editFamilyId ? 'Salva modifiche' : 'Aggiungi'}
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
        <h2>Elenco adozioni ({families.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Nome</th>
              <th>Cognome</th>
              <th>Indirizzo</th>
              <th>Città</th>
              <th>Stato</th>
              <th>Pacchetto</th>
              <th>Totale</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {familiesWithTotals.map(({ family, total }) => (
              <tr key={family.id}>
                <td>{family.type === 'famiglia' ? 'Famiglia' : 'Persona'}</td>
                <td>{family.name}</td>
                <td>{family.surname || '-'}</td>
                <td>{family.address || '-'}</td>
                <td>{family.city || '-'}</td>
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
