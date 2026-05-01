'use client';

import { useEffect, useState } from 'react';

type Adopted = {
  id: string;
  name: string;
  birthDate: string | null;
  gender: string | null;
  motherName: string | null;
  fatherName: string | null;
  schoolGrade: string | null;
  notes: string | null;
};

export default function AdoptedPage() {
  const [adopted, setAdopted] = useState<Adopted[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    gender: '',
    motherName: '',
    fatherName: '',
    schoolGrade: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await fetch('/api/adopted');
      if (res.ok) {
        const data = await res.json();
        setAdopted(data);
      }
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/adopted/${editingId}` : '/api/adopted';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          birthDate: formData.birthDate || null,
        }),
      });

      if (res.ok) {
        loadData();
        resetForm();
      }
    } catch (error) {
      console.error('Errore:', error);
    }
  }

  function startEdit(item: Adopted) {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      birthDate: item.birthDate ? new Date(item.birthDate).toISOString().slice(0, 10) : '',
      gender: item.gender || '',
      motherName: item.motherName || '',
      fatherName: item.fatherName || '',
      schoolGrade: item.schoolGrade || '',
      notes: item.notes || '',
    });
    setShowForm(true);
  }

  async function deleteItem(id: string) {
    if (!confirm('Eliminare questo adottato?')) return;
    try {
      const res = await fetch(`/api/adopted/${id}`, { method: 'DELETE' });
      if (res.ok) loadData();
    } catch (error) {
      console.error('Errore:', error);
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      birthDate: '',
      gender: '',
      motherName: '',
      fatherName: '',
      schoolGrade: '',
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  }

  if (loading) return <div className="main"><p>Caricamento...</p></div>;

  return (
    <main className="main">
      <section className="header">
        <h1>Gestione Adottati</h1>
        <p>Anagrafica dei bambini e ragazzi sostenuti.</p>
      </section>

      <section className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2>{editingId ? 'Modifica' : 'Nuovo'} Adottato</h2>
          {!showForm && (
            <button onClick={() => setShowForm(true)}>+ Aggiungi</button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="formGroup">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label>
                Nome *
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </label>
              <label>
                Data di nascita
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label>
                Sesso
                <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                  <option value="">Seleziona</option>
                  <option value="M">Maschio</option>
                  <option value="F">Femmina</option>
                </select>
              </label>
              <label>
                Grado scolastico
                <input
                  value={formData.schoolGrade}
                  onChange={(e) => setFormData({ ...formData, schoolGrade: e.target.value })}
                  placeholder="Es. Scuola primaria"
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label>
                Nome madre
                <input
                  value={formData.motherName}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                />
              </label>
              <label>
                Nome padre
                <input
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                />
              </label>
            </div>

            <label>
              Note
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </label>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit">{editingId ? 'Salva modifiche' : 'Aggiungi'}</button>
              <button type="button" className="secondary" onClick={resetForm}>Annulla</button>
            </div>
          </form>
        )}
      </section>

      <section className="panel" style={{ marginTop: 24 }}>
        <h2>Elenco Adottati ({adopted.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Data di nascita</th>
              <th>Sesso</th>
              <th>Grado scolastico</th>
              <th>Note</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {adopted.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.birthDate ? new Date(item.birthDate).toLocaleDateString('it-IT') : '-'}</td>
                <td>{item.gender === 'M' ? 'M' : item.gender === 'F' ? 'F' : '-'}</td>
                <td>{item.schoolGrade || '-'}</td>
                <td>{item.notes ? item.notes.substring(0, 50) + (item.notes.length > 50 ? '...' : '') : '-'}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => startEdit(item)}>Modifica</button>
                  <button className="secondary" onClick={() => deleteItem(item.id)}>Elimina</button>
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