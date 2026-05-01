'use client';

import { useEffect, useState } from 'react';

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
  receiptIssued: boolean;
  family?: { id: string; name: string; surname: string };
  adoption?: { id: string; familyId: string; adoptedId: string };
  fund?: { id: string; name: string };
};

type Family = { id: string; name: string; surname: string; status?: string };
type Adoption = { id: string; familyId: string; adoptedId: string; isActive?: boolean };
type Fund = { id: string; name: string };

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    familyId: '',
    adoptionId: '',
    fundId: '',
    amount: '',
    date: '',
    competenceYear: '',
    description: '',
    issueReceipt: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [paymentsRes, familiesRes, adoptionsRes, fundsRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/families'),
        fetch('/api/adoptions'),
        fetch('/api/funds'),
      ]);

      if (paymentsRes.ok) setPayments(await paymentsRes.json());
      if (familiesRes.ok) setFamilies(await familiesRes.json());
      if (adoptionsRes.ok) setAdoptions(await adoptionsRes.json());
      if (fundsRes.ok) setFunds(await fundsRes.json());
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.familyId || !formData.amount || !formData.date) {
      alert('Compila i campi obbligatori');
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = '/api/payments';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: editingId || undefined,
          amount: parseFloat(formData.amount),
          competenceYear: formData.competenceYear ? parseInt(formData.competenceYear) : undefined,
          adoptionId: formData.adoptionId || null,
          fundId: formData.fundId || null,
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

  function startEdit(payment: Payment) {
    setEditingId(payment.id);
    setFormData({
      familyId: payment.familyId,
      adoptionId: payment.adoptionId || '',
      fundId: payment.fundId || '',
      amount: payment.amount.toString(),
      date: new Date(payment.date).toISOString().slice(0, 10),
      competenceYear: payment.competenceYear.toString(),
      description: payment.description || '',
      issueReceipt: payment.receiptIssued,
    });
  }

  function resetForm() {
    setFormData({
      familyId: '',
      adoptionId: '',
      fundId: '',
      amount: '',
      date: '',
      competenceYear: '',
      description: '',
      issueReceipt: false,
    });
    setEditingId(null);
  }

  async function deletePayment(id: string) {
    if (!confirm('Eliminare questo versamento?')) return;
    try {
      const res = await fetch(`/api/payments?id=${id}`, { method: 'DELETE' });
      if (res.ok) loadData();
    } catch (error) {
      console.error('Errore:', error);
    }
  }

  function getFamilyName(familyId: string) {
    const family = families.find(f => f.id === familyId);
    return family ? `${family.name} ${family.surname || ''}`.trim() : 'Sconosciuto';
  }

  function getFundName(fundId: string | null) {
    if (!fundId) return '-';
    const fund = funds.find(f => f.id === fundId);
    return fund?.name || 'Sconosciuto';
  }

  const currentYear = new Date().getFullYear();

  if (loading) return <div className="main"><p>Caricamento...</p></div>;

  return (
    <main className="main">
      <section className="header">
        <h1>Gestione Pagamenti</h1>
        <p>Registra, modifica o elimina i versamenti per le famiglie.</p>
      </section>

      <section className="panel">
        <h2>{editingId ? 'Modifica' : 'Nuovo'} versamento</h2>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              Fondo
              <select
                value={formData.fundId}
                onChange={(e) => setFormData({ ...formData, fundId: e.target.value })}
              >
                <option value="">Nessuno</option>
                {funds.map((fund) => (
                  <option key={fund.id} value={fund.id}>
                    {fund.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Adozione (opzionale)
              <select
                value={formData.adoptionId}
                onChange={(e) => setFormData({ ...formData, adoptionId: e.target.value })}
              >
                <option value="">Nessuna</option>
                {adoptions.filter(a => a.isActive).map((adoption) => (
                  <option key={adoption.id} value={adoption.id}>
                    {getFamilyName(adoption.familyId)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              Importo (€) *
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </label>
            <label>
              Data *
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              Anno competenza
              <input
                type="number"
                min="2000"
                max="2100"
                value={formData.competenceYear}
                onChange={(e) => setFormData({ ...formData, competenceYear: e.target.value })}
                placeholder={currentYear.toString()}
              />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={formData.issueReceipt}
                onChange={(e) => setFormData({ ...formData, issueReceipt: e.target.checked })}
                disabled={!!editingId}
              />
              <span>Emetti ricevuta</span>
            </label>
          </div>

          <label>
            Descrizione / Note
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Es. Donazione mensile"
            />
          </label>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="submit">
              {editingId ? 'Salva modifiche' : 'Registra versamento'}
            </button>
            {editingId && (
              <button type="button" className="secondary" onClick={resetForm}>
                Annulla
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel" style={{ marginTop: 24 }}>
        <h2>Storico versamenti ({payments.length})</h2>
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
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{new Date(payment.date).toLocaleDateString('it-IT')}</td>
                <td>{payment.competenceYear}</td>
                <td>{getFamilyName(payment.familyId)}</td>
                <td>{getFundName(payment.fundId)}</td>
                <td>€ {payment.amount.toFixed(2)}</td>
                <td>
                  {payment.receiptIssued ? (
                    <span className="badge" style={{ background: '#dcfce7', color: '#166534' }}>
                      {payment.receiptNumber}
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>No</span>
                  )}
                </td>
                <td>{payment.description ? payment.description.substring(0, 30) + (payment.description.length > 30 ? '...' : '') : '-'}</td>
                <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => startEdit(payment)}>Modifica</button>
                  <button className="secondary" onClick={() => deletePayment(payment.id)}>
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