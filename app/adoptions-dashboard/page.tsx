'use client';

import { useState, useEffect } from 'react';

interface Statistics {
  totalFamilies: number;
  totalAdopted: number;
  activeAdoptions: number;
  totalPayments: number;
  monthlyRevenue: number;
  averageAdoptionDuration: number;
}

export default function AdoptionsDashboardPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/statistics');
      if (!response.ok) {
        throw new Error('Errore nel caricamento delle statistiche');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div>Caricamento dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        color: '#dc2626',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        padding: '12px',
        margin: '20px',
        textAlign: 'center'
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '32px', color: '#1e293b' }}>Dashboard Adozioni</h1>

      {/* Cards statistiche */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '14px', fontWeight: '500' }}>
            Famiglie Registrate
          </h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#1e293b' }}>
            {stats?.totalFamilies || 0}
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '14px', fontWeight: '500' }}>
            Adottati Registrati
          </h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#1e293b' }}>
            {stats?.totalAdopted || 0}
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '14px', fontWeight: '500' }}>
            Adozioni Attive
          </h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#059669' }}>
            {stats?.activeAdoptions || 0}
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '14px', fontWeight: '500' }}>
            Totale Pagamenti
          </h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#1e293b' }}>
            {stats?.totalPayments || 0}
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '14px', fontWeight: '500' }}>
            Ricavi Mensili
          </h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#059669' }}>
            {formatCurrency(stats?.monthlyRevenue || 0)}
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '14px', fontWeight: '500' }}>
            Durata Media Adozione
          </h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#1e293b' }}>
            {stats?.averageAdoptionDuration ? `${Math.round(stats.averageAdoptionDuration)} mesi` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Azioni rapide */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>Azioni Rapide</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <a
            href="/families"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
          >
            Gestisci Famiglie
          </a>
          <a
            href="/adopted"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
          >
            Gestisci Adottati
          </a>
          <a
            href="/adoptions"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#f59e0b',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
          >
            Gestisci Adozioni
          </a>
          <a
            href="/payments"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
          >
            Visualizza Pagamenti
          </a>
        </div>
      </div>
    </div>
  );
}