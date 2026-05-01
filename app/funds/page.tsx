'use client';

import { useEffect, useState } from 'react';

type Fund = {
  id: string;
  name: string;
  description: string | null;
};

export default function FundsPage() {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await fetch('/api/funds');
      if (res.ok) {
        setFunds(await res.json());
      }
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Il nome è obbligatorio');
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/funds/${editingId}` : '/api/funds';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        loadData();
        resetForm();
      }
    } catch (error) {
      console.error('Errore:', error);
    }
  }

  function startEdit(fund: Fund) {
    setEditingId(fund.id);
    setFormData({
      name: fund.name,
      description: fund.description || '',
    });
    setShowForm(true);
  }

  async function deleteFund(id: string) {
    if (!confirm('Eliminare questo fondo?')) return;
    try {
      const res = await fetch(`/api/funds/${id}`, { method: 'DELETE' });
      if (res.ok) loadData();
    } catch (error) {
      console.error('Errore:', error);
    }
  }

  function resetForm() {
    setFormData({ name: '', description: '' });
    setEditingId(null);
    setShowForm(false);
  }

  if (loading) return <div className="main"><p>Caricamento...</p></div>;

  return (
    <main className="main">
      <section className="header">
        <h1>Gestione Fondi</h1>
        <p>Classificazione dei versamenti per tipologia.</p>
      </section>

      <section className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2>{editingId ? 'Modifica' : 'Nuovo'} Fondo</h2>
          {!showForm && (
            <button onClick={() => setShowForm(true)}>+ Aggiungi</button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="formGroup">
            <label>
              Nome *
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Es. Donazioni Generiche"
                required
              />
            </label>

            <label>
              Descrizione
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrizione opzionale del fondo"
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
        <h2>Elenco Fondi ({funds.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrizione</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {funds.map((fund) => (
              <tr key={fund.id}>
                <td>{fund.name}</td>
                <td>{fund.description || '-'}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => startEdit(fund)}>Modifica</button>
                  <button className="secondary" onClick={() => deleteFund(fund.id)}>Elimina</button>
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