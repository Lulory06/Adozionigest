import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Dati per la generazione casuale
const firstNames = [
  'Mario', 'Luigi', 'Giuseppe', 'Antonio', 'Francesco', 'Giovanni', 'Andrea', 'Marco', 'Alessandro', 'Lorenzo',
  'Matteo', 'Leonardo', 'Riccardo', 'Gabriele', 'Mattia', 'Tommaso', 'Edoardo', 'Federico', 'Giorgio', 'Davide',
  'Chiara', 'Giulia', 'Sara', 'Martina', 'Francesca', 'Elena', 'Anna', 'Maria', 'Laura', 'Valentina',
  'Alessia', 'Beatrice', 'Federica', 'Giada', 'Alice', 'Gaia', 'Bianca', 'Cecilia', 'Ilaria', 'Silvia'
];

const lastNames = [
  'Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco',
  'Bruno', 'Gallo', 'Conti', 'De Luca', 'Mancini', 'Costa', 'Giordano', 'Rizzo', 'Lombardi', 'Moretti',
  'Barbieri', 'Fontana', 'Santoro', 'Mariani', 'Rinaldi', 'Caruso', 'Ferrara', 'Galli', 'Martini', 'Leone',
  'Longo', 'Gentile', 'Martinelli', 'Vitale', 'Lombardo', 'Serra', 'Coppola', 'De Santis', 'D\'Angelo', 'Marchetti'
];

const cities = [
  'Roma', 'Milano', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna', 'Firenze', 'Bari', 'Catania',
  'Venezia', 'Verona', 'Messina', 'Padova', 'Trieste', 'Brescia', 'Parma', 'Taranto', 'Prato', 'Modena'
];

const countries = [
  'Italia', 'Brasile', 'Filippine', 'India', 'Kenya', 'Perù', 'Colombia', 'Ecuador', 'Tanzania', 'Etiopia',
  'Repubblica Dominicana', 'Albania', 'Romania', 'Marocco', 'Egitto', 'Ghana', 'Nigeria', 'Uganda', 'Madagascar', 'Vietnam'
];

const genders = ['M', 'F'];
const schoolGrades = ['Scuola dell\'infanzia', 'Scuola primaria', 'Scuola secondaria di primo grado', 'Scuola secondaria di secondo grado'];
const packages = ['Classe', 'bambino singolo', 'progetto scuola', 'sostegno a distanza'];
const statuses = ['active', 'inactive', 'suspended'];
const fundNames = [
  'Donazioni Generiche', 'Adozioni a Distanza', 'Progetti Speciali', 'Emergenza Fame', 'Istruzione',
  'Sanità', 'Acqua Potabile', 'Sostegno Orfani', 'Microcredito', 'Sviluppo Comunitario',
  'Formazione Professionale', 'Protezione Infanzia', 'Diritti Umani', 'Agricoltura Sostenibile', 'Energia Rinnovabile',
  'Non c\'è il villaggio', 'AdoTA', 'AdoTG', 'AdoTB', 'AdoTC', 'AdoTD', 'AdoTE', 'AdoTF', 'AdoTG', 'AdoTH',
  'AdoTI', 'AdoTJ', 'AdoTK', 'AdoTL', 'AdoTM', 'AdoTN', 'AdoTO', 'AdoTP', 'AdoTQ', 'AdoTR', 'AdoTS',
  'AdoTT', 'AdoTU', 'AdoTV', 'AdoTW', 'AdoTX', 'AdoTY', 'AdoTZ', 'Fondo1', 'Fondo2', 'Fondo3', 'Fondo4', 'Fondo5'
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(startYear = 2000, endYear = 2026): Date {
  const year = startYear + Math.floor(Math.random() * (endYear - startYear + 1));
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(year, month, day);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

async function main() {
  // Pulisci il database
  console.log('Pulizia database...');
  await prisma.payment.deleteMany({});
  await prisma.adoption.deleteMany({});
  await prisma.adopted.deleteMany({});
  await prisma.family.deleteMany({});
  await prisma.fund.deleteMany({});
  await prisma.user.deleteMany({});

  // Crea utente admin di default
  console.log('Creazione utenti...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@adozioni.it',
      name: 'Amministratore',
      password: hashedPassword,
      role: 'admin',
    },
  });

  // Crea altri 49 utenti casuali
  for (let i = 0; i < 49; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    await prisma.user.create({
      data: {
        email: `user${i + 1}@adozioni.it`,
        name: `${firstName} ${lastName}`,
        password: hashedPassword,
        role: randomElement(['admin', 'user', 'viewer']),
      },
    });
  }

  // Crea 50 famiglie
  console.log('Creazione famiglie...');
  const families = [];
  for (let i = 0; i < 50; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const family = await prisma.family.create({
      data: {
        name: `Famiglia ${lastName} ${firstName}`,
        surname: lastName,
        country: randomElement(countries),
        package: randomElement(packages),
        type: randomElement(['famiglia', 'associazione', 'parrocchia', 'scuola']),
        address: `Via ${randomElement(lastNames)} ${randomInt(1, 100)}`,
        city: randomElement(cities),
        cap: `${randomInt(10000, 99999)}`,
        province: randomElement(['RM', 'MI', 'NA', 'TO', 'PA', 'GE', 'BO', 'FI', 'BA', 'CT']),
        region: randomElement(['Lazio', 'Lombardia', 'Campania', 'Piemonte', 'Sicilia', 'Liguria', 'Emilia-Romagna', 'Toscana', 'Puglia', 'Calabria']),
        status: randomElement(statuses),
      },
    });
    families.push(family);
  }

  // Crea 50 adottati
  console.log('Creazione adottati...');
  const adopteds = [];
  for (let i = 0; i < 50; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const adopted = await prisma.adopted.create({
      data: {
        name: `${firstName} ${lastName}`,
        birthDate: randomDate(2005, 2018),
        gender: randomElement(genders),
        motherName: `Madre ${lastName}`,
        fatherName: `Padre ${lastName}`,
        schoolGrade: randomElement(schoolGrades),
        notes: `Note per ${firstName} ${lastName}`,
      },
    });
    adopteds.push(adopted);
  }

  // Crea 50 fondi
  console.log('Creazione fondi...');
  const funds = [];
  for (let i = 0; i < 50; i++) {
    const fund = await prisma.fund.create({
      data: {
        name: fundNames[i % fundNames.length],
        description: `Descrizione del fondo ${i + 1}`,
      },
    });
    funds.push(fund);
  }

  // Crea 50 adozioni (una per ogni adottato, per evitare duplicati con isActive: true)
  console.log('Creazione adozioni...');
  const adoptions = [];
  for (let i = 0; i < 50; i++) {
    const family = families[i % families.length];
    const adopted = adopteds[i];
    const adoption = await prisma.adoption.create({
      data: {
        familyId: family.id,
        adoptedId: adopted.id,
        startDate: randomDate(2020, 2026),
        isActive: true,
      },
    });
    adoptions.push(adoption);
  }

  // Crea 50 pagamenti
  console.log('Creazione pagamenti...');
  for (let i = 0; i < 50; i++) {
    const family = randomElement(families);
    const adoption = randomElement(adoptions);
    const fund = randomElement(funds);
    await prisma.payment.create({
      data: {
        familyId: family.id,
        adoptionId: adoption.id,
        fundId: fund.id,
        amount: randomFloat(50, 500),
        date: randomDate(2023, 2026),
        competenceYear: randomInt(2023, 2026),
        description: `${randomElement(['Contributo per', 'Donazione per', 'Pagamento per', 'Versamento per', 'Offerta per'])} ${randomElement(['adozione', 'fondo', 'progetto', 'emergenza'])}`,
        receiptNumber: `2026-${String(i + 1).padStart(3, '0')}`,
        receiptIssued: Math.random() > 0.5,
      },
    });
  }

  // Crea categorie entrate
  console.log('Creazione categorie entrate...');
  const incomeCategories = await Promise.all([
    prisma.incomeCategory.create({ data: { name: 'Donazioni Generiche', description: 'Donazioni non specifiche' } }),
    prisma.incomeCategory.create({ data: { name: 'Adozioni a Distanza', description: 'Contributi per adozioni' } }),
    prisma.incomeCategory.create({ data: { name: 'Progetti Speciali', description: 'Finanziamenti per progetti specifici' } }),
    prisma.incomeCategory.create({ data: { name: 'Eventi Benefici', description: 'Incassi da eventi' } }),
    prisma.incomeCategory.create({ data: { name: 'Sostegno Istituzionale', description: 'Contributi da enti pubblici' } }),
  ]);

  // Crea categorie uscite
  console.log('Creazione categorie uscite...');
  const expenseCategories = await Promise.all([
    prisma.expenseCategory.create({ data: { name: 'Spese Amministrative', description: 'Costi amministrativi generali' } }),
    prisma.expenseCategory.create({ data: { name: 'Progetti Sviluppo', description: 'Spese per progetti di sviluppo' } }),
    prisma.expenseCategory.create({ data: { name: 'Assistenza Sanitaria', description: 'Spese mediche e sanitarie' } }),
    prisma.expenseCategory.create({ data: { name: 'Istruzione', description: 'Spese per l\'educazione' } }),
    prisma.expenseCategory.create({ data: { name: 'Materiali', description: 'Acquisto di materiali e beni' } }),
    prisma.expenseCategory.create({ data: { name: 'Trasporti', description: 'Spese di trasporto e viaggio' } }),
    prisma.expenseCategory.create({ data: { name: 'Comunicazione', description: 'Spese per comunicazione e marketing' } }),
  ]);

  // Crea alcune transazioni di esempio
  console.log('Creazione transazioni...');
  for (let i = 0; i < 30; i++) {
    const isIncome = Math.random() > 0.4; // 60% entrate, 40% uscite
    const amount = randomFloat(100, 2000);
    const date = randomDate(2024, 2026);

    if (isIncome) {
      const category = randomElement(incomeCategories);
      await prisma.transaction.create({
        data: {
          type: 'ENTRATA',
          amount,
          date,
          description: `Entrata: ${category.name}`,
          incomeCategoryId: category.id,
          paymentMethod: randomElement(['CONTANTI', 'BONIFICO', 'PAYPAL']),
          documentNumber: `ENT-${String(i + 1).padStart(3, '0')}`,
        },
      });
    } else {
      const category = randomElement(expenseCategories);
      await prisma.transaction.create({
        data: {
          type: 'USCITA',
          amount,
          date,
          description: `Uscita: ${category.name}`,
          expenseCategoryId: category.id,
          paymentMethod: randomElement(['BONIFICO', 'ASSEGNO', 'CARTA_CREDITO']),
          documentNumber: `USC-${String(i + 1).padStart(3, '0')}`,
        },
      });
    }
  }

  console.log('Seed completato con successo!');
  console.log(`Creati: 50 utenti, 50 famiglie, 50 adottati, 50 fondi, 50 adozioni, 50 pagamenti, 5 categorie entrate, 7 categorie uscite, 30 transazioni.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });