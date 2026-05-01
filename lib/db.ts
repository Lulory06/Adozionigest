import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;

// ==================== FAMILY ====================
export const family = {
  getAll: () => prisma.family.findMany({ orderBy: { createdAt: 'desc' } }),
  getActive: () => prisma.family.findMany({ where: { status: 'active' }, orderBy: { name: 'asc' } }),
  getById: (id: string) => prisma.family.findUnique({ where: { id } }),
  create: (data: any) => prisma.family.create({ data }),
  update: (id: string, data: any) => prisma.family.update({ where: { id }, data }),
  delete: (id: string) => prisma.family.delete({ where: { id } }),
};

// ==================== ADOPTED ====================
export const adopted = {
  getAll: () => prisma.adopted.findMany({ orderBy: { name: 'asc' } }),
  getById: (id: string) => prisma.adopted.findUnique({ where: { id } }),
  getActive: () => prisma.adopted.findMany({
    include: { adoptions: { where: { isActive: true }, include: { family: true } } },
    orderBy: { name: 'asc' },
  }),
  create: (data: any) => prisma.adopted.create({ data }),
  update: (id: string, data: any) => prisma.adopted.update({ where: { id }, data }),
  delete: (id: string) => prisma.adopted.delete({ where: { id } }),
};

// ==================== ADOPTION ====================
export const adoption = {
  getAll: () => prisma.adoption.findMany({
    include: { family: true, adopted: true },
    orderBy: { createdAt: 'desc' },
  }),
  getActive: () => prisma.adoption.findMany({
    where: { isActive: true },
    include: { family: true, adopted: true },
    orderBy: { startDate: 'desc' },
  }),
  getById: (id: string) => prisma.adoption.findUnique({
    where: { id },
    include: { family: true, adopted: true },
  }),
  getByFamily: (familyId: string) => prisma.adoption.findMany({
    where: { familyId },
    include: { adopted: true },
    orderBy: { startDate: 'desc' },
  }),
  getByAdopted: (adoptedId: string) => prisma.adoption.findMany({
    where: { adoptedId },
    include: { family: true },
    orderBy: { startDate: 'desc' },
  }),
  create: (data: any) => prisma.adoption.create({
    data,
    include: { family: true, adopted: true },
  }),
  update: (id: string, data: any) => prisma.adoption.update({
    where: { id },
    data,
    include: { family: true, adopted: true },
  }),
  close: (id: string, endDate: Date) => prisma.adoption.update({
    where: { id },
    data: { endDate, isActive: false },
    include: { family: true, adopted: true },
  }),
  delete: (id: string) => prisma.adoption.delete({ where: { id } }),
  hasActive: (adoptedId: string) => prisma.adoption.count({
    where: { adoptedId, isActive: true },
  }).then(count => count > 0),
};

// ==================== FUND ====================
export const fund = {
  getAll: () => prisma.fund.findMany({ orderBy: { name: 'asc' } }),
  getById: (id: string) => prisma.fund.findUnique({ where: { id } }),
  create: (data: any) => prisma.fund.create({ data }),
  update: (id: string, data: any) => prisma.fund.update({ where: { id }, data }),
  delete: (id: string) => prisma.fund.delete({ where: { id } }),
};

// ==================== PAYMENT ====================
export const payment = {
  getAll: () => prisma.payment.findMany({
    include: { family: true, adoption: true, fund: true },
    orderBy: { date: 'desc' },
  }),
  getById: (id: string) => prisma.payment.findUnique({
    where: { id },
    include: { family: true, adoption: true, fund: true },
  }),
  getByFamily: (familyId: string) => prisma.payment.findMany({
    where: { familyId },
    include: { adoption: true, fund: true },
    orderBy: { date: 'desc' },
  }),
  getByAdoption: (adoptionId: string) => prisma.payment.findMany({
    where: { adoptionId },
    include: { family: true, fund: true },
    orderBy: { date: 'desc' },
  }),
  getByYear: (year: number) => prisma.payment.findMany({
    where: { competenceYear: year },
    include: { family: true, adoption: true, fund: true },
    orderBy: { date: 'desc' },
  }),
  getByFund: (fundId: string) => prisma.payment.findMany({
    where: { fundId },
    include: { family: true, adoption: true, fund: true },
    orderBy: { date: 'desc' },
  }),
  create: (data: any) => prisma.payment.create({
    data,
    include: { family: true, adoption: true, fund: true },
  }),
  update: (id: string, data: any) => prisma.payment.update({ where: { id }, data }),
  delete: (id: string) => prisma.payment.delete({ where: { id } }),
  getNextReceiptNumber: async (year: number): Promise<string> => {
    const last = await prisma.payment.findFirst({
      where: { competenceYear: year, receiptNumber: { not: null } },
      orderBy: { receiptNumber: 'desc' },
    });
    if (!last || !last.receiptNumber) return `${year}-001`;
    const num = parseInt(last.receiptNumber.split('-')[1]);
    return `${year}-${String(num + 1).padStart(3, '0')}`;
  },
};

// ==================== USER ====================
export const user = {
  getByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
  getById: (id: string) => prisma.user.findUnique({ where: { id } }),
  create: (data: any) => prisma.user.create({ data }),
  update: (id: string, data: any) => prisma.user.update({ where: { id }, data }),
  delete: (id: string) => prisma.user.delete({ where: { id } }),
};

// ==================== STATISTICS ====================
export async function getStatistics() {
  const [
    totalFamilies,
    activeFamilies,
    totalAdopted,
    activeAdoptions,
    totalPayments,
    paymentsThisYear,
  ] = await Promise.all([
    prisma.family.count(),
    prisma.family.count({ where: { status: 'active' } }),
    prisma.adopted.count(),
    prisma.adoption.count({ where: { isActive: true } }),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { competenceYear: new Date().getFullYear() },
    }),
  ]);

  return {
    totalFamilies,
    activeFamilies,
    totalAdopted,
    activeAdoptions,
    totalPayments: totalPayments._sum.amount || 0,
    paymentsThisYear: paymentsThisYear._sum.amount || 0,
  };
}

// Close connection on exit
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});