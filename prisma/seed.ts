import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Crea utente admin di default
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@adozioni.it' },
    update: {},
    create: {
      email: 'admin@adozioni.it',
      name: 'Amministratore',
      password: hashedPassword,
      role: 'admin',
    },
  });

  // Crea fondi predefiniti
  await prisma.fund.upsert({
    where: { id: 'fund-1' },
    update: {},
    create: {
      id: 'fund-1',
      name: 'Donazioni Generiche',
      description: 'Donazioni libere non vincolate',
    },
  });

  await prisma.fund.upsert({
    where: { id: 'fund-2' },
    update: {},
    create: {
      id: 'fund-2',
      name: 'Adozioni a Distanza',
      description: 'Contributi per adozioni',
    },
  });

  await prisma.fund.upsert({
    where: { id: 'fund-3' },
    update: {},
    create: {
      id: 'fund-3',
      name: 'Progetti Speciali',
      description: 'Progetti specifici e straordinari',
    },
  });

  // Crea famiglie di esempio
  await prisma.family.upsert({
    where: { id: 'fam-1' },
    update: {},
    create: {
      id: 'fam-1',
      name: 'Famiglia Rossi',
      surname: 'Rossi',
      country: 'Italia',
      package: 'Classe',
      type: 'famiglia',
      address: 'Via Roma 123',
      city: 'Roma',
      cap: '00100',
      province: 'RM',
      region: 'Lazio',
      status: 'active',
    },
  });

  await prisma.family.upsert({
    where: { id: 'fam-2' },
    update: {},
    create: {
      id: 'fam-2',
      name: 'Famiglia Silva',
      surname: 'Silva',
      country: 'Brasile',
      package: 'bambino singolo',
      type: 'famiglia',
      address: 'Rua das Flores 456',
      city: 'São Paulo',
      cap: '01000',
      province: 'SP',
      region: 'São Paulo',
      status: 'active',
    },
  });

  // Crea adottati di esempio
  await prisma.adopted.upsert({
    where: { id: 'adopt-1' },
    update: {},
    create: {
      id: 'adopt-1',
      name: 'Maria Santos',
      birthDate: new Date('2015-03-15'),
      gender: 'F',
      motherName: 'Ana Santos',
      fatherName: 'José Santos',
      schoolGrade: 'Scuola primaria',
      notes: 'Bambina molto vivace e curiosa',
    },
  });

  await prisma.adopted.upsert({
    where: { id: 'adopt-2' },
    update: {},
    create: {
      id: 'adopt-2',
      name: 'João Pereira',
      birthDate: new Date('2012-07-22'),
      gender: 'M',
      motherName: 'Lucia Pereira',
      fatherName: 'Marco Pereira',
      schoolGrade: 'Scuola secondaria',
      notes: 'Appassionato di calcio',
    },
  });

  // Crea adozioni di esempio
  await prisma.adoption.upsert({
    where: { id: 'adoption-1' },
    update: {},
    create: {
      id: 'adoption-1',
      familyId: 'fam-1',
      adoptedId: 'adopt-1',
      startDate: new Date('2024-01-01'),
      isActive: true,
    },
  });

  await prisma.adoption.upsert({
    where: { id: 'adoption-2' },
    update: {},
    create: {
      id: 'adoption-2',
      familyId: 'fam-2',
      adoptedId: 'adopt-2',
      startDate: new Date('2023-06-15'),
      isActive: true,
    },
  });

  // Crea pagamenti di esempio
  await prisma.payment.upsert({
    where: { id: 'pay-1' },
    update: {},
    create: {
      id: 'pay-1',
      familyId: 'fam-1',
      adoptionId: 'adoption-1',
      fundId: 'fund-2',
      amount: 150,
      date: new Date('2026-04-01'),
      competenceYear: 2026,
      description: 'Versamento mensile adozione',
      receiptNumber: '2026-001',
      receiptIssued: true,
    },
  });

  await prisma.payment.upsert({
    where: { id: 'pay-2' },
    update: {},
    create: {
      id: 'pay-2',
      familyId: 'fam-2',
      adoptionId: 'adoption-2',
      fundId: 'fund-2',
      amount: 120,
      date: new Date('2026-04-05'),
      competenceYear: 2026,
      description: 'Versamento adozione',
      receiptNumber: '2026-002',
      receiptIssued: true,
    },
  });

  await prisma.payment.upsert({
    where: { id: 'pay-3' },
    update: {},
    create: {
      id: 'pay-3',
      familyId: 'fam-1',
      fundId: 'fund-1',
      amount: 50,
      date: new Date('2026-04-10'),
      competenceYear: 2026,
      description: 'Donazione libera',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });