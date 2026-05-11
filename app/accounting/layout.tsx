'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface AccountingLayoutProps {
  children: ReactNode;
}

export default function AccountingLayout({ children }: AccountingLayoutProps) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Contabilità</h1>

          {/* Sotto-navigazione */}
          <nav style={{
            background: 'white',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link
                href="/accounting"
                style={{
                  color: '#475569',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                Dashboard
              </Link>
              <Link
                href="/accounting/transactions"
                style={{
                  color: '#475569',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                Transazioni
              </Link>
              <Link
                href="/accounting/income-categories"
                style={{
                  color: '#475569',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                Categorie Entrate
              </Link>
              <Link
                href="/accounting/expense-categories"
                style={{
                  color: '#475569',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                Categorie Uscite
              </Link>
            </div>
          </nav>
        </div>

        {children}
      </div>
    </div>
  );
}