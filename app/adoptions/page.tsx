'use client';

import { useEffect, useState } from 'react';

type Adoption = {
  id: string;
  familyId: string;
  adoptedId: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  family?: { id: string; name: string; surname: string };
  adopted?: { id: string; name: string };
};

type Family = { id: string; name: string; surname: string; status?: string };
type Adopted = { id: string; name: string };

export default function AdoptionsPage() {
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [adopted, setAdopted] = useState<Adopted[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    familyId: '',
    adoptedId: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [adoptionsRes, familiesRes, adoptedRes] = await Promise.all([
        fetch('/api/adoptions'),
        fetch('/api/families'),
        fetch('/api/adopted'),
      ]);

      if (adoptionsRes.ok) setAdoptions(await adoptionsRes.json());
      if (familiesRes.ok) setFamilies(await familiesRes.json());
      if (adoptedRes.ok) setAdopted(await adoptedRes.json());
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.familyId || !formData.adoptedId || !formData.startDate) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    try {
      const res = await fetch('/api/adoptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyId: formData.familyId,
          adoptedId: formData.adoptedId,
          startDate: formData.startDate,
          endDate: formData.endDate || null,
        }),
      });

      if (res.ok) {
        loadData();
        resetForm();
      } else {
        const err = await res.json();
        alert(err.error || 'Errore nella creazione');
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore nella creazione');
    }
  }

  async function closeAdoption(id: string) {
    if (!confirm('Chiudere questa adozione?')) return;
    try {
      const res = await fetch(`/api/adoptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close' }),
      });

      if (res.ok) loadData();
    } catch (error) {
      console.error('Errore:', error);
    }
  }

  async function deleteAdoption(id: string) {
    if (!confirm('Eliminare questa adozione?')) return;
    try {
      const res = await fetch(`/api/adoptions/${id}`, { method: 'DELETE' });
      if (res.ok) loadData();
    } catch (error) {
      console.error('Errore:', error);
    }
  }

  function resetForm() {
    setFormData({ familyId: '', adoptedId: '', startDate: '', endDate: '' });
    setShowForm(false);
  }

  function getFamilyName(familyId: string) {
    const family = families.find(f => f.id === familyId);
    return family ? `${family.name} ${family.surname || ''}`.trim() : 'Sconosciuto';
  }

  function getAdoptedName(adoptedId: string) {
    const adoptedItem = adopted.find(a => a.id === adoptedId);
    return adoptedItem?.name || 'Sconosciuto';
  }

  if (loading) return <div className="main"><p>Caricamento...</p></div>;

  return (
    <main className="main">
      <section className="header">
        <h1>Gestione Adozioni</h1>
        <p>Collega le famiglie agli adottati e gestisci il ciclo di vita.</p>
      </section>

      <section className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2>Nuova Adozione</h2>
          {!showForm && (
            <button onClick={() => setShowForm(true)}>+ Aggiungi</button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="formGroup">
            <label>
              Famiglia *
              <select
                value={formData.familyId}
                onChange={(e) => setFormData({ ...formData, familyId: e.target.value })}
                required
              >
                <option value="">Seleziona famiglia</option>
                {families.filter(f => f.status !== 'archived').map((family) => (
                  <option key={family.id} value={family.id}>
                    {family.name} {family.surname}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Adottato *
              <select
                value={formData.adoptedId}
                onChange={(e) => setFormData({ ...formData, adoptedId: e.target.value })}
                required
              >
                <option value="">Seleziona adottato</option>
                {adopted.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label>
                Data inizio *
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </label>
              <label>
                Data fine (opzionale)
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </label>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit">Crea Adozione</button>
              <button type="button" className="secondary" onClick={resetForm}>Annulla</button>
            </div>
          </form>
        )}
      </section>

      <section className="panel" style={{ marginTop: 24 }}>
        <h2>Adozioni ({adoptions.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Famiglia</th>
              <th>Adottato</th>
              <th>Data inizio</th>
              <th>Data fine</th>
              <th>Stato</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {adoptions.map((adoption) => (
              <tr key={adoption.id}>
                <td>{getFamilyName(adoption.familyId)}</td>
                <td>{getAdoptedName(adoption.adoptedId)}</td>
                <td>{new Date(adoption.startDate).toLocaleDateString('it-IT')}</td>
                <td>{adoption.endDate ? new Date(adoption.endDate).toLocaleDateString('it-IT') : '-'}</td>
                <td>
                  <span className="badge" style={{
                    background: adoption.isActive ? '#dcfce7' : '#f1f5f9',
                    color: adoption.isActive ? '#166534' : '#64748b',
                  }}>
                    {adoption.isActive ? 'Attiva' : 'Conclusa'}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: 8 }}>
                  {adoption.isActive && (
                    <button onClick={() => closeAdoption(adoption.id)}>Chiudi</button>
                  )}
                  <button className="secondary" onClick={() => deleteAdoption(adoption.id)}>Elimina</button>
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