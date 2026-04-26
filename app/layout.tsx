import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adozioni a distanza",
  description: "Gestisci famiglie, adozioni e pagamenti a distanza.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        <nav style={{
          background: '#1e293b',
          color: 'white',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Adozioni a Distanza</h1>
          <div style={{ display: 'flex', gap: 12 }}>
            <a href="/" style={{ color: 'white', textDecoration: 'none', padding: '8px 12px', borderRadius: 4, background: 'transparent', transition: 'background 0.2s' }}>Dashboard</a>
            <a href="/families" style={{ color: 'white', textDecoration: 'none', padding: '8px 12px', borderRadius: 4, background: 'transparent', transition: 'background 0.2s' }}>Famiglie</a>
            <a href="/payments" style={{ color: 'white', textDecoration: 'none', padding: '8px 12px', borderRadius: 4, background: 'transparent', transition: 'background 0.2s' }}>Pagamenti</a>
            <a href="/reports" style={{ color: 'white', textDecoration: 'none', padding: '8px 12px', borderRadius: 4, background: 'transparent', transition: 'background 0.2s' }}>Estrazioni</a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
