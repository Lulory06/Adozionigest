import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type Family = {
  id: string;
  type: string;
  name: string;
  surname: string;
  address: string;
  city: string;
  cap: string;
  province: string;
  region: string;
  country: string;
  package: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Payment = {
  id: string;
  familyId: string;
  amount: number;
  date: string;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Families functions
export function getAllFamilies(): Promise<Family[]> {
  return prisma.family.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export function getFamilyById(id: string): Promise<Family | null> {
  return prisma.family.findUnique({ where: { id } });
}

export function createFamily(family: Omit<Family, 'createdAt' | 'updatedAt'>) {
  return prisma.family.create({ data: family });
}

export function updateFamily(id: string, family: Omit<Family, 'id' | 'createdAt' | 'updatedAt'>) {
  return prisma.family.update({ where: { id }, data: family });
}

export function deleteFamily(id: string) {
  return prisma.family.delete({ where: { id } });
}

// Payments functions
export function getAllPayments(): Promise<Payment[]> {
  return prisma.payment.findMany({
    orderBy: { date: 'desc' },
  });
}

export function getPaymentsByFamily(familyId: string): Promise<Payment[]> {
  return prisma.payment.findMany({
    where: { familyId },
    orderBy: { date: 'desc' },
  });
}

export function createPayment(payment: Omit<Payment, 'createdAt' | 'updatedAt'>) {
  return prisma.payment.create({ data: payment });
}

export function updatePayment(id: string, payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) {
  return prisma.payment.update({ where: { id }, data: payment });
}

export function deletePayment(id: string) {
  return prisma.payment.delete({ where: { id } });
}

// Inizializza con dati di esempio se il DB è vuoto
prisma.family.count().then(async (count) => {
  if (count === 0) {
    await prisma.family.upsert({ where: { id: 'fam-1' }, update: {}, create: { id: 'fam-1', name: 'Famiglia Rossi', country: 'Italia', package: 'Base' } });
    await prisma.family.upsert({ where: { id: 'fam-2' }, update: {}, create: { id: 'fam-2', name: 'Famiglia Silva', country: 'Brasile', package: 'Premium' } });
    await prisma.payment.upsert({ where: { id: 'pay-1' }, update: {}, create: { id: 'pay-1', familyId: 'fam-1', amount: 60, date: '2026-04-01', note: 'Donazione mensile' } });
    await prisma.payment.upsert({ where: { id: 'pay-2' }, update: {}, create: { id: 'pay-2', familyId: 'fam-2', amount: 120, date: '2026-04-05', note: 'Versamento extra' } });
  }
});