import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adozioni a distanza",
  description: "Gestisci famiglie, adottati, adozioni e pagamenti a distanza.",
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
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Adozioni a Distanza</h1>
          <div className="navLinks">
            <details className="navItem">
              <summary className="navLabel">Anagrafiche</summary>
              <div className="navDropdown">
                <a href="/families">Famiglie</a>
                <a href="/adopted">Adottati</a>
                <a href="/family-adoptions">Associazioni Famiglie-Adottati</a>
                <a href="/funds">Fondi</a>
              </div>
            </details>

            <details className="navItem">
              <summary className="navLabel">Adozioni</summary>
              <div className="navDropdown">
                <a href="/adoptions-dashboard">Dashboard Adozioni</a>
                <a href="/adoptions">Gestione Adozioni</a>
              </div>
            </details>

            <details className="navItem">
              <summary className="navLabel">Contabilità</summary>
              <div className="navDropdown">
                <a href="/accounting">Dashboard Contabilità</a>
                <a href="/payments">Pagamenti</a>
              </div>
            </details>

            <details className="navItem">
              <summary className="navLabel">Report</summary>
              <div className="navDropdown">
                <a href="/reports">Report Adozioni e Contabilità</a>
              </div>
            </details>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}