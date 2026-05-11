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

// ==================== ACCOUNTING ====================

// Income Categories
export const incomeCategory = {
  getAll: () => prisma.incomeCategory.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  }),
  getAllIncludingInactive: () => prisma.incomeCategory.findMany({
    orderBy: { name: 'asc' }
  }),
  getById: (id: string) => prisma.incomeCategory.findUnique({ where: { id } }),
  create: (data: { name: string; description?: string; isActive?: boolean }) =>
    prisma.incomeCategory.create({ data }),
  update: (id: string, data: { name?: string; description?: string; isActive?: boolean }) =>
    prisma.incomeCategory.update({ where: { id }, data }),
  delete: (id: string) => prisma.incomeCategory.delete({ where: { id } }),
};

// Expense Categories
export const expenseCategory = {
  getAll: () => prisma.expenseCategory.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  }),
  getAllIncludingInactive: () => prisma.expenseCategory.findMany({
    orderBy: { name: 'asc' }
  }),
  getById: (id: string) => prisma.expenseCategory.findUnique({ where: { id } }),
  create: (data: { name: string; description?: string; isActive?: boolean }) =>
    prisma.expenseCategory.create({ data }),
  update: (id: string, data: { name?: string; description?: string; isActive?: boolean }) =>
    prisma.expenseCategory.update({ where: { id }, data }),
  delete: (id: string) => prisma.expenseCategory.delete({ where: { id } }),
};

// Transactions
export const transaction = {
  getAll: (filters?: {
    type?: 'ENTRATA' | 'USCITA';
    startDate?: Date;
    endDate?: Date;
    categoryId?: string;
    familyId?: string;
  }) => {
    const where: any = {};
    if (filters?.type) where.type = filters.type;
    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = filters.startDate;
      if (filters.endDate) where.date.lte = filters.endDate;
    }
    if (filters?.categoryId) {
      where.OR = [
        { incomeCategoryId: filters.categoryId },
        { expenseCategoryId: filters.categoryId }
      ];
    }
    if (filters?.familyId) where.familyId = filters.familyId;

    return prisma.transaction.findMany({
      where,
      include: {
        incomeCategory: true,
        expenseCategory: true,
        family: true,
        user: true
      },
      orderBy: { date: 'desc' }
    });
  },
  getById: (id: string) => prisma.transaction.findUnique({
    where: { id },
    include: {
      incomeCategory: true,
      expenseCategory: true,
      family: true,
      user: true
    }
  }),
  create: (data: {
    type: 'ENTRATA' | 'USCITA';
    amount: number;
    date: Date;
    description: string;
    incomeCategoryId?: string;
    expenseCategoryId?: string;
    familyId?: string;
    paymentMethod?: 'CONTANTI' | 'BONIFICO' | 'ASSEGNO' | 'CARTA_CREDITO' | 'PAYPAL' | 'RID' | 'ALTRO';
    documentNumber?: string;
    notes?: string;
    userId?: string;
  }) => prisma.transaction.create({
    data,
    include: {
      incomeCategory: true,
      expenseCategory: true,
      family: true,
      user: true
    }
  }),
  update: (id: string, data: {
    type?: 'ENTRATA' | 'USCITA';
    amount?: number;
    date?: Date;
    description?: string;
    incomeCategoryId?: string;
    expenseCategoryId?: string;
    familyId?: string;
    paymentMethod?: 'CONTANTI' | 'BONIFICO' | 'ASSEGNO' | 'CARTA_CREDITO' | 'PAYPAL' | 'RID' | 'ALTRO';
    documentNumber?: string;
    notes?: string;
  }) => prisma.transaction.update({
    where: { id },
    data,
    include: {
      incomeCategory: true,
      expenseCategory: true,
      family: true,
      user: true
    }
  }),
  delete: (id: string) => prisma.transaction.delete({ where: { id } }),
};

// Accounting Overview
export async function getAccountingOverview(period: string = 'mese') {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  switch (period) {
    case 'giorno':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'settimana':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'mese':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'trimestre':
      startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      break;
    case 'semestre':
      startDate = new Date(now.getFullYear(), now.getMonth() < 6 ? 0 : 6, 1);
      break;
    case 'anno':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const [incomeResult, expenseResult, incomeByCategory, expenseByCategory] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { amount: true },
      _count: true,
      where: {
        type: 'ENTRATA',
        date: { gte: startDate, lte: endDate }
      }
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      _count: true,
      where: {
        type: 'USCITA',
        date: { gte: startDate, lte: endDate }
      }
    }),
    prisma.transaction.groupBy({
      by: ['incomeCategoryId'],
      _sum: { amount: true },
      where: {
        type: 'ENTRATA',
        date: { gte: startDate, lte: endDate },
        incomeCategoryId: { not: null }
      }
    }),
    prisma.transaction.groupBy({
      by: ['expenseCategoryId'],
      _sum: { amount: true },
      where: {
        type: 'USCITA',
        date: { gte: startDate, lte: endDate },
        expenseCategoryId: { not: null }
      }
    })
  ]);

  const totalIncome = incomeResult._sum.amount || 0;
  const totalExpense = expenseResult._sum.amount || 0;
  const balance = totalIncome - totalExpense;
  const transactionCount = incomeResult._count + expenseResult._count;

  // Calcola media giornaliera
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;
  const dailyAverage = balance / daysDiff;

  // Prepara dati categorie
  const incomeCategories = await Promise.all(
    incomeByCategory.map(async (item) => {
      const category = await prisma.incomeCategory.findUnique({
        where: { id: item.incomeCategoryId! }
      });
      return {
        id: item.incomeCategoryId,
        name: category?.name || 'Categoria sconosciuta',
        amount: item._sum.amount || 0
      };
    })
  );

  const expenseCategories = await Promise.all(
    expenseByCategory.map(async (item) => {
      const category = await prisma.expenseCategory.findUnique({
        where: { id: item.expenseCategoryId! }
      });
      return {
        id: item.expenseCategoryId,
        name: category?.name || 'Categoria sconosciuta',
        amount: item._sum.amount || 0
      };
    })
  );

  return {
    period,
    startDate,
    endDate,
    summary: {
      totalIncome,
      totalExpense,
      balance,
      transactionCount,
      dailyAverage
    },
    incomeByCategory: incomeCategories,
    expenseByCategory: expenseCategories
  };
}

// Close connection on exit
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});