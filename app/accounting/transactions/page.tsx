'use client';

import { useState, useEffect } from 'react';

interface Transaction {
  id: string;
  type: 'ENTRATA' | 'USCITA';
  amount: number;
  date: string;
  registrationDate: string;
  description: string;
  incomeCategoryId: string | null;
  incomeCategory: { id: string; name: string } | null;
  expenseCategoryId: string | null;
  expenseCategory: { id: string; name: string } | null;
  familyId: string | null;
  family: { id: string; name: string } | null;
  paymentMethod: string | null;
  documentNumber: string | null;
  notes: string | null;
  userId: string | null;
  user: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

interface Family {
  id: string;
  name: string;
  status: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('it-IT');
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    startDate: '',
    endDate: '',
    categoryId: ''
  });

  const [formData, setFormData] = useState({
    type: 'ENTRATA' as 'ENTRATA' | 'USCITA',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    incomeCategoryId: '',
    expenseCategoryId: '',
    familyId: '',
    paymentMethod: '',
    documentNumber: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [transactionsRes, incomeCatRes, expenseCatRes, familiesRes] = await Promise.all([
        fetch('/api/accounting/transactions'),
        fetch('/api/accounting/income-categories'),
        fetch('/api/accounting/expense-categories'),
        fetch('/api/families')
      ]);

      if (!transactionsRes.ok || !incomeCatRes.ok || !expenseCatRes.ok || !familiesRes.ok) {
        throw new Error('Errore nel caricamento dei dati');
      }

      const [transactionsData, incomeCatData, expenseCatData, familiesData] = await Promise.all([
        transactionsRes.json(),
        incomeCatRes.json(),
        expenseCatRes.json(),
        familiesRes.json()
      ]);

      setTransactions(transactionsData);
      setIncomeCategories(incomeCatData.filter((cat: Category) => cat.isActive));
      setExpenseCategories(expenseCatData.filter((cat: Category) => cat.isActive));
      setFamilies(familiesData.filter((fam: Family) => fam.status === 'active'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      type: 'ENTRATA',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      incomeCategoryId: '',
      expenseCategoryId: '',
      familyId: '',
      paymentMethod: '',
      documentNumber: '',
      notes: ''
    });
    setEditingTransaction(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        incomeCategoryId: formData.type === 'ENTRATA' ? formData.incomeCategoryId : undefined,
        expenseCategoryId: formData.type === 'USCITA' ? formData.expenseCategoryId : undefined,
        familyId: formData.familyId || undefined,
        paymentMethod: formData.paymentMethod || undefined,
        documentNumber: formData.documentNumber || undefined,
        notes: formData.notes || undefined
      };

      const url = editingTransaction
        ? '/api/accounting/transactions'
        : '/api/accounting/transactions';

      const method = editingTransaction ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingTransaction && { id: editingTransaction.id }),
          ...submitData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nell\'operazione');
      }

      await fetchData();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'operazione');
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      date: new Date(transaction.date).toISOString().split('T')[0],
      description: transaction.description,
      incomeCategoryId: transaction.incomeCategoryId || '',
      expenseCategoryId: transaction.expenseCategoryId || '',
      familyId: transaction.familyId || '',
      paymentMethod: transaction.paymentMethod || '',
      documentNumber: transaction.documentNumber || '',
      notes: transaction.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa transazione?')) return;

    try {
      const response = await fetch(`/api/accounting/transactions?id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Errore nell\'eliminazione');
      }

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'eliminazione');
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filters.type && transaction.type !== filters.type) return false;
    if (filters.startDate && new Date(transaction.date) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(transaction.date) > new Date(filters.endDate)) return false;
    if (filters.categoryId) {
      const categoryId = transaction.incomeCategoryId || transaction.expenseCategoryId;
      if (categoryId !== filters.categoryId) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div>Caricamento...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Registro Transazioni</h2>
        <button
          onClick={() => setShowForm(true)}
          style={{
            backgroundColor: '#16a34a',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
        >
          + Nuova Transazione
        </button>
      </div>

      {error && (
        <div style={{
          color: '#dc2626',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* Filtri */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Filtri</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>
              Tipo
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                minWidth: '120px'
              }}
            >
              <option value="">Tutti</option>
              <option value="ENTRATA">Entrate</option>
              <option value="USCITA">Uscite</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>
              Dal
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>
              Al
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>
              Categoria
            </label>
            <select
              value={filters.categoryId}
              onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                minWidth: '150px'
              }}
            >
              <option value="">Tutte</option>
              {[...incomeCategories, ...expenseCategories].map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setFilters({ type: '', startDate: '', endDate: '', categoryId: '' })}
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '24px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>
            {editingTransaction ? 'Modifica Transazione' : 'Nuova Transazione'}
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>
                  Tipo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'ENTRATA' | 'USCITA' })}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="ENTRATA">Entrata</option>
                  <option value="USCITA">Uscita</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>
                  Importo (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>
                  Data *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>
                  Categoria *
                </label>
                <select
                  value={formData.type === 'ENTRATA' ? formData.incomeCategoryId : formData.expenseCategoryId}
                  onChange={(e) => setFormData({
                    ...formData,
                    incomeCategoryId: formData.type === 'ENTRATA' ? e.target.value : '',
                    expenseCategoryId: formData.type === 'USCITA' ? e.target.value : ''
                  })}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Seleziona categoria</option>
                  {formData.type === 'ENTRATA'
                    ? incomeCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))
                    : expenseCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))
                  }
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>
                Descrizione *
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>
                  Famiglia
                </label>
                <select
                  value={formData.familyId}
                  onChange={(e) => setFormData({ ...formData, familyId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Seleziona famiglia</option>
                  {families.map(family => (
                    <option key={family.id} value={family.id}>{family.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>
                  Metodo Pagamento
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Seleziona metodo</option>
                  <option value="CONTANTI">Contanti</option>
                  <option value="BONIFICO">Bonifico</option>
                  <option value="ASSEGNO">Assegno</option>
                  <option value="CARTA_CREDITO">Carta di Credito</option>
                  <option value="PAYPAL">PayPal</option>
                  <option value="RID">RID</option>
                  <option value="ALTRO">Altro</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>
                  Numero Documento
                </label>
                <input
                  type="text"
                  value={formData.documentNumber}
                  onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>
                Note
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                style={{
                  backgroundColor: formData.type === 'ENTRATA' ? '#16a34a' : '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {editingTransaction ? 'Aggiorna' : 'Crea'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Annulla
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabella transazioni */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {filteredTransactions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Nessuna transazione trovata
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Data</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Tipo</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Descrizione</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Categoria</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Famiglia</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Importo</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>
                      {formatDate(transaction.date)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: transaction.type === 'ENTRATA' ? '#dcfce7' : '#fee2e2',
                        color: transaction.type === 'ENTRATA' ? '#166534' : '#991b1b'
                      }}>
                        {transaction.type === 'ENTRATA' ? 'Entrata' : 'Uscita'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '500', color: '#1e293b' }}>
                      {transaction.description}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>
                      {transaction.incomeCategory?.name || transaction.expenseCategory?.name || '-'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>
                      {transaction.family?.name || '-'}
                    </td>
                    <td style={{
                      padding: '12px 16px',
                      textAlign: 'right',
                      fontWeight: '600',
                      color: transaction.type === 'ENTRATA' ? '#16a34a' : '#dc2626'
                    }}>
                      {transaction.type === 'ENTRATA' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEdit(transaction)}
                        style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          marginRight: '8px'
                        }}
                      >
                        Modifica
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        style={{
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        Elimina
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}