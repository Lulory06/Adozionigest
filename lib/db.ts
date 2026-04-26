import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'data');
const FAMILIES_FILE = path.join(DB_DIR, 'families.json');
const PAYMENTS_FILE = path.join(DB_DIR, 'payments.json');

// Assicurati che la directory dei dati esista
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Inizializza i file se non esistono
if (!fs.existsSync(FAMILIES_FILE)) {
  fs.writeFileSync(FAMILIES_FILE, JSON.stringify([]));
}
if (!fs.existsSync(PAYMENTS_FILE)) {
  fs.writeFileSync(PAYMENTS_FILE, JSON.stringify([]));
}

export type Family = {
  id: string;
  name: string;
  country: string;
  package: string;
  createdAt: string;
  updatedAt: string;
};

export type Payment = {
  id: string;
  familyId: string;
  amount: number;
  date: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

function readFamilies(): Family[] {
  try {
    const data = fs.readFileSync(FAMILIES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeFamilies(families: Family[]): void {
  fs.writeFileSync(FAMILIES_FILE, JSON.stringify(families, null, 2));
}

function readPayments(): Payment[] {
  try {
    const data = fs.readFileSync(PAYMENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writePayments(payments: Payment[]): void {
  fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2));
}

// Families functions
export function getAllFamilies(): Family[] {
  return readFamilies().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getFamilyById(id: string): Family | undefined {
  return readFamilies().find(f => f.id === id);
}

export function createFamily(family: Omit<Family, 'createdAt' | 'updatedAt'>) {
  const families = readFamilies();
  const now = new Date().toISOString();
  const newFamily: Family = {
    ...family,
    createdAt: now,
    updatedAt: now,
  };
  families.push(newFamily);
  writeFamilies(families);
}

export function updateFamily(id: string, family: Omit<Family, 'id' | 'createdAt' | 'updatedAt'>) {
  const families = readFamilies();
  const index = families.findIndex(f => f.id === id);
  if (index !== -1) {
    families[index] = {
      ...families[index],
      ...family,
      updatedAt: new Date().toISOString(),
    };
    writeFamilies(families);
  }
}

export function deleteFamily(id: string) {
  const families = readFamilies();
  const filtered = families.filter(f => f.id !== id);
  writeFamilies(filtered);

  // Elimina anche i pagamenti correlati
  const payments = readPayments();
  const filteredPayments = payments.filter(p => p.familyId !== id);
  writePayments(filteredPayments);
}

// Payments functions
export function getAllPayments(): Payment[] {
  return readPayments().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPaymentsByFamily(familyId: string): Payment[] {
  return readPayments()
    .filter(p => p.familyId === familyId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function createPayment(payment: Omit<Payment, 'createdAt' | 'updatedAt'>) {
  const payments = readPayments();
  const now = new Date().toISOString();
  const newPayment: Payment = {
    ...payment,
    createdAt: now,
    updatedAt: now,
  };
  payments.push(newPayment);
  writePayments(payments);
}

export function updatePayment(id: string, payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) {
  const payments = readPayments();
  const index = payments.findIndex(p => p.id === id);
  if (index !== -1) {
    payments[index] = {
      ...payments[index],
      ...payment,
      updatedAt: new Date().toISOString(),
    };
    writePayments(payments);
  }
}

export function deletePayment(id: string) {
  const payments = readPayments();
  const filtered = payments.filter(p => p.id !== id);
  writePayments(filtered);
}

// Inizializza con dati di esempio se il DB è vuoto
if (getAllFamilies().length === 0) {
  createFamily({ id: 'fam-1', name: 'Famiglia Rossi', country: 'Italia', package: 'Base' });
  createFamily({ id: 'fam-2', name: 'Famiglia Silva', country: 'Brasile', package: 'Premium' });
  createPayment({ id: 'pay-1', familyId: 'fam-1', amount: 60, date: '2026-04-01', note: 'Donazione mensile' });
  createPayment({ id: 'pay-2', familyId: 'fam-2', amount: 120, date: '2026-04-05', note: 'Versamento extra' });
}