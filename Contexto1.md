# Prompt: Implementazione Modulo Contabilità per AdozioniGEST

Sei uno sviluppatore senior specializzato in Next.js 14, TypeScript e Prisma.
Devi aggiungere un modulo di contabilità completo al progetto open source **AdozioniGEST**, un gestionale web per adozioni e sostegni a distanza.
Il progetto attuale è disponibile su https://github.com/Lulory06/Adozionigest.

## Contesto del Progetto Esistente

- **Stack**: Next.js 14 (App Router), TypeScript, Prisma ORM, SQLite/PostgreSQL, NextAuth.js
- **Funzionalità già presenti**: gestione famiglie, adottati, adozioni, pagamenti legati alle adozioni, dashboard con statistiche
- **Autenticazione**: provider credentials NextAuth.js con JWT, utente demo admin@adozioni.it / admin123
- **Struttura cartelle**:
  - `app/` - pagine e API routes
  - `app/api/` - route handlers per famiglie, adottati, adozioni, pagamenti, fondi
  - `lib/db.ts` - client Prisma e funzioni di accesso dati
  - `prisma/schema.prisma` - schema del database
- **Stile**: CSS personalizzato, nessuna libreria UI specifica (usa classi semplici)

## Obiettivo

Aggiungere un modulo di **Contabilità Generale** che permetta all'associazione di registrare tutte le entrate e le uscite, classificate per categorie, e di consultare panoramiche temporali dettagliate.

## Requisiti Funzionali

1. **Anagrafica Categorie Entrate** (`incomeCategory`)
   - CRUD completo
   - Campi: nome (univoco), descrizione, attivo/disattivo

2. **Anagrafica Categorie Uscite** (`expenseCategory`)
   - CRUD completo
   - Campi: nome (univoco), descrizione, attivo/disattivo

3. **Registratore Contabile** (`transaction`)
   - Form per inserire una nuova transazione (entrata o uscita) con:
     - Tipo (ENTRATA/USCITA)
     - Importo
     - Data competenza
     - Categoria (entrata o uscita in base al tipo)
     - Metodo pagamento (CONTANTI, BONIFICO, ASSEGNO, CARTA_CREDITO, PAYPAL, RID, ALTRO)
     - Numero documento/ricevuta (opzionale)
     - Descrizione
     - Note
     - Possibilità di collegare a una Famiglia (opzionale, per i pagamenti già esistenti)
   - Validazione lato client e server
   - Solo utenti autenticati possono creare/modificare

4. **Dashboard Panoramica** (`/accounting`)
   - Selettore periodo: giorno, settimana, mese, trimestre, semestre, anno
   - Cards riepilogative: totale entrate, totale uscite, saldo, media giornaliera
   - Tabella ripartizione per categoria
   - Dati da API `/api/accounting/overview?period=mese`

5. **Registro Transazioni** (`/accounting/transactions`)
   - Elenco paginato con filtri: tipo, data inizio/fine, categoria
   - Possibilità di modificare/eliminare
   - Esportazione CSV (opzionale)

## Implementazione Tecnica

### 1. Schema Prisma da Aggiungere

```prisma
model IncomeCategory {
  id          String       @id @default(cuid())
  name        String       @unique
  description String?
  isActive    Boolean      @default(true)
  transactions Transaction[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model ExpenseCategory {
  id          String       @id @default(cuid())
  name        String       @unique
  description String?
  isActive    Boolean      @default(true)
  transactions Transaction[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Transaction {
  id                String          @id @default(cuid())
  type              TransactionType
  amount            Float
  date              DateTime
  registrationDate  DateTime        @default(now())
  description       String
  incomeCategoryId  String?
  incomeCategory    IncomeCategory? @relation(fields: [incomeCategoryId], references: [id])
  expenseCategoryId String?
  expenseCategory   ExpenseCategory? @relation(fields: [expenseCategoryId], references: [id])
  familyId          String?
  family            Family?         @relation(fields: [familyId], references: [id])
  paymentMethod     PaymentMethod?
  documentNumber    String?
  notes             String?
  userId            String?
  user              User?           @relation(fields: [userId], references: [id])
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
}

enum TransactionType {
  ENTRATA
  USCITA
}

enum PaymentMethod {
  CONTANTI
  BONIFICO
  ASSEGNO
  CARTA_CREDITO
  PAYPAL
  RID
  ALTRO
}