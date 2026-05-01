# Adozioni a Distanza - Gestionale Web

Un'applicazione web moderna per la gestione di adozioni/sostegni a distanza, sviluppata con Next.js 14, TypeScript, Prisma e SQLite.

## 🚀 Funzionalità

### Gestione Anagrafiche
- **Famiglie**: Anagrafica delle famiglie sostenitrici con stato (attiva/archiviata)
- **Adottati**: Anagrafica dei bambini/ragazzi sostenuti con dati personali e scolastici
- **Adozioni**: Gestione del ciclo di vita delle adozioni (inizio, fine, attiva/conclusa)

### Gestione Economica
- **Pagamenti/Versamenti**: Registrazione versamenti con:
  - Collegamento a famiglia e adozione
  - Classificazione per fondo
  - Anno di competenza distinto dalla data
  - Generazione ricevute con numerazione progressiva annuale
- **Fondi**: Classificazione versamenti (Donazioni generiche, Adozioni, Progetti speciali)

### Reportistica
- Filtri avanzati per famiglia, fondo, mese, anno, anno competenza
- Riepilogo per fondo
- Esportazione CSV
- Dashboard con statistiche e indicatori chiave

### Autenticazione
- Login con credenziali (NextAuth.js)
- Utente demo: `admin@adozioni.it` / `admin123`

## 🛠️ Stack Tecnologico

- **Frontend/Backend**: Next.js 14 con App Router
- **Linguaggio**: TypeScript
- **Database**: SQLite (sviluppo) / PostgreSQL (produzione)
- **ORM**: Prisma
- **Autenticazione**: NextAuth.js
- **Stile**: CSS personalizzato

## 📦 Installazione

### Prerequisiti
- Node.js 18+
- npm o yarn

### Passaggi

1. Clona il repository:
```bash
git clone <repository-url>
cd AdozioniGEST
```

2. Installa le dipendenze:
```bash
npm install
```

3. Configura le variabili d'ambiente:
```bash
cp .env.example .env
```

4. Genera il client Prisma:
```bash
npm run db:generate
```

5. Esegui la migrazione del database:
```bash
npm run db:push
```

6. Popola il database con dati di esempio:
```bash
npm run db:seed
```

7. Avvia il server di sviluppo:
```bash
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:3000`

## 📁 Struttura del Progetto

```
AdozioniGEST/
├── app/
│   ├── api/              # API routes
│   │   ├── adopted/      # Gestione adottati
│   │   ├── adoptions/    # Gestione adozioni
│   │   ├── auth/         # NextAuth
│   │   ├── families/     # Gestione famiglie
│   │   ├── funds/        # Gestione fondi
│   │   ├── payments/     # Gestione pagamenti
│   │   └── statistics/   # Statistiche
│   ├── adopted/          # Pagina adottati
│   ├── adoptions/        # Pagina adozioni
│   ├── families/         # Pagina famiglie
│   ├── funds/            # Pagina fondi
│   ├── payments/         # Pagina pagamenti
│   ├── reports/          # Pagina report
│   ├── login/            # Pagina login
│   ├── layout.tsx        # Layout principale
│   └── page.tsx          # Dashboard
├── lib/
│   ├── db.ts             # Database functions
│   └── auth.ts           # NextAuth configuration
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
└── types/
    └── next-auth.d.ts    # NextAuth type definitions
```

## 🔑 Credenziali Demo

- **Email**: admin@adozioni.it
- **Password**: admin123

## 📊 Modello Dati

### Entità Principali

- **Family**: Famiglie sostenitrici
- **Adopted**: Bambini/ragazzi sostenuti
- **Adoption**: Relazione tra famiglia e adottato
- **Payment**: Versamenti/donazioni
- **Fund**: Tipologia di versamenti
- **User**: Utenti del sistema

## 🔧 Script Disponibili

```bash
npm run dev          # Avvia server di sviluppo
npm run build        # Build di produzione
npm start            # Avvia server di produzione
npm run db:generate  # Genera Prisma Client
npm run db:push      # Aggiorna il database
npm run db:seed      # Popola il database
npm run db:studio    # Apre Prisma Studio
```

## 📝 Note

- Il database SQLite (`dev.db`) è incluso per lo sviluppo
- Per la produzione, configurare PostgreSQL modificando `prisma/schema.prisma`
- I dati di esempio vengono creati automaticamente al primo avvio

## 👨‍💻 Sviluppo

Il progetto è stato sviluppato seguendo le best practices di Next.js 14:
- App Router per la navigazione
- Server Components dove possibile
- API routes per il backend
- TypeScript per la type safety

## 📄 License

MIT