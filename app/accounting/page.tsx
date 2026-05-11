'use client';

import { useState, useEffect } from 'react';

interface AccountingOverview {
  period: string;
  startDate: string;
  endDate: string;
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
    dailyAverage: number;
  };
  incomeByCategory: Array<{
    id: string;
    name: string;
    amount: number;
  }>;
  expenseByCategory: Array<{
    id: string;
    name: string;
    amount: number;
  }>;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

const getPeriodLabel = (period: string) => {
  const labels: Record<string, string> = {
    giorno: 'Giornaliero',
    settimana: 'Settimanale',
    mese: 'Mensile',
    trimestre: 'Trimestrale',
    semestre: 'Semestrale',
    anno: 'Annuale'
  };
  return labels[period] || 'Mensile';
};

export default function AccountingDashboard() {
  const [overview, setOverview] = useState<AccountingOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('mese');

  const fetchOverview = async (period: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/accounting/overview?period=${period}`);
      if (!response.ok) {
        throw new Error('Errore nel caricamento dei dati');
      }
      const data = await response.json();
      setOverview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview(selectedPeriod);
  }, [selectedPeriod]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div>Caricamento...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: '#dc2626',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <div>Errore: {error}</div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div>Nessun dato disponibile</div>
      </div>
    );
  }

  return (
    <div>
      {/* Selettore periodo */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Panoramica {getPeriodLabel(selectedPeriod)}</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ fontWeight: '500', color: '#475569' }}>Periodo:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              fontSize: '14px'
            }}
          >
            <option value="giorno">Giornaliero</option>
            <option value="settimana">Settimanale</option>
            <option value="mese">Mensile</option>
            <option value="trimestre">Trimestrale</option>
            <option value="semestre">Semestrale</option>
            <option value="anno">Annuale</option>
          </select>
        </div>
      </div>

      {/* Cards riepilogative */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#16a34a', fontSize: '14px', fontWeight: '600' }}>
            TOTALE ENTRATE
          </h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>
            {formatCurrency(overview.summary.totalIncome)}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#dc2626', fontSize: '14px', fontWeight: '600' }}>
            TOTALE USCITE
          </h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
            {formatCurrency(overview.summary.totalExpense)}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: overview.summary.balance >= 0 ? '#16a34a' : '#ea580c', fontSize: '14px', fontWeight: '600' }}>
            SALDO
          </h3>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: overview.summary.balance >= 0 ? '#16a34a' : '#ea580c'
          }}>
            {formatCurrency(overview.summary.balance)}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
            TRANSAZIONI
          </h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
            {overview.summary.transactionCount}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
            MEDIA GIORNALIERA
          </h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
            {formatCurrency(overview.summary.dailyAverage)}
          </div>
        </div>
      </div>

      {/* Ripartizione per categorie */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '16px'
      }}>
        {/* Entrate per categoria */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#16a34a' }}>Entrate per Categoria</h3>
          {overview.incomeByCategory.length === 0 ? (
            <div style={{ color: '#64748b', fontStyle: 'italic' }}>Nessuna entrata registrata</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {overview.incomeByCategory.map((category) => (
                <div key={category.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontWeight: '500', color: '#374151' }}>{category.name}</span>
                  <span style={{ fontWeight: '600', color: '#16a34a' }}>{formatCurrency(category.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Uscite per categoria */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#dc2626' }}>Uscite per Categoria</h3>
          {overview.expenseByCategory.length === 0 ? (
            <div style={{ color: '#64748b', fontStyle: 'italic' }}>Nessuna uscita registrata</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {overview.expenseByCategory.map((category) => (
                <div key={category.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontWeight: '500', color: '#374151' }}>{category.name}</span>
                  <span style={{ fontWeight: '600', color: '#dc2626' }}>{formatCurrency(category.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}