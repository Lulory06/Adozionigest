'use client';

import { useState, useEffect } from 'react';

interface Adoption {
  id: string;
  familyId: string;
  adoptedId: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  family: {
    id: string;
    name: string;
    surname: string;
  };
  adopted: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function FamilyAdoptionsPage() {
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdoptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/adoptions');
      if (!response.ok) {
        throw new Error('Errore nel caricamento delle associazioni');
      }
      const data = await response.json();
      setAdoptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdoptions();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

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
        <h2 style={{ margin: 0, color: '#1e293b' }}>Associazioni Famiglie - Adottati</h2>
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

      {/* Lista associazioni */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {adoptions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Nessuna associazione presente
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Famiglia</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Adottato</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Data Inizio</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Data Fine</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Stato</th>
                </tr>
              </thead>
              <tbody>
                {adoptions.map((adoption) => (
                  <tr key={adoption.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>
                      {adoption.family.name} {adoption.family.surname}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>
                      {adoption.adopted.name}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>
                      {formatDate(adoption.startDate)}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>
                      {adoption.endDate ? formatDate(adoption.endDate) : '-'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: adoption.isActive ? '#dcfce7' : '#fee2e2',
                        color: adoption.isActive ? '#166534' : '#dc2626'
                      }}>
                        {adoption.isActive ? 'Attiva' : 'Terminata'}
                      </span>
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