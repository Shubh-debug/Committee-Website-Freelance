const YEAR_RE = /^\d{4}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateYear(value) {
  const year = Number(value);
  if (!YEAR_RE.test(String(value)) || !Number.isInteger(year) || year < 1900 || year > 9999) {
    throw new Error('Invalid financial year');
  }
  return year;
}

export function validateDate(value, label = 'Date') {
  if (typeof value !== 'string' || !DATE_RE.test(value)) throw new Error(`${label} is required`);
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`${label} is invalid`);
  }
  return value;
}

export function validateTransactionDate(value, label, selectedYear) {
  const date = validateDate(value, label);
  const year = validateYear(selectedYear);
  const today = new Date();
  const todayValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const currentYear = today.getFullYear();
  if (year !== currentYear) throw new Error('Transactions can only be added for the current year');
  if (date < `${currentYear}-01-01`) throw new Error('Date must be in the current year');
  if (date.slice(0, 4) !== String(year)) throw new Error('Date must belong to the selected year');
  if (date > todayValue) throw new Error('Future dates cannot be used');
  return date;
}

export function validateId(value) {
  if (!UUID_RE.test(value)) throw new Error('Invalid id');
  return value;
}

export function amountToCents(value, label = 'Amount') {
  const amount = typeof value === 'number' ? value : Number(String(value).trim());
  if (!Number.isFinite(amount) || amount <= 0 || amount > 999999999999.99) {
    throw new Error(`${label} must be a positive number`);
  }
  return Math.round(amount * 100);
}

export function nonNegativeAmountToCents(value, label = 'Amount') {
  const amount = typeof value === 'number' ? value : Number(String(value).trim());
  if (!Number.isFinite(amount) || amount < 0 || amount > 999999999999.99) {
    throw new Error(`${label} must be a non-negative number`);
  }
  return Math.round(amount * 100);
}

function cents(value) {
  return Math.round(Number(value || 0) * 100);
}

function yearOf(date) {
  return Number(String(date).slice(0, 4));
}

function sorted(rows, dateKey) {
  return [...rows].sort((a, b) => {
    const date = String(a[dateKey]).localeCompare(String(b[dateKey]));
    if (date !== 0) return date;
    const created = String(a.created_at || '').localeCompare(String(b.created_at || ''));
    return created !== 0 ? created : String(a.id).localeCompare(String(b.id));
  });
}

export function calculateOverview({ settings, contributions, expenses, year }) {
  const initialBalance = settings?.initial_closing_balance;
  const initialized = initialBalance !== null && initialBalance !== undefined;
  const initialCents = initialized ? cents(initialBalance) : 0;
  const openingCents = initialCents
    + contributions.filter((row) => yearOf(row.contribution_date) < year).reduce((sum, row) => sum + cents(row.amount), 0)
    - expenses.filter((row) => yearOf(row.expense_date) < year).reduce((sum, row) => sum + cents(row.amount), 0);
  const peopleCents = contributions
    .filter((row) => yearOf(row.contribution_date) === year && row.type === 'people')
    .reduce((sum, row) => sum + cents(row.amount), 0);
  const mandalMemberCents = contributions
    .filter((row) => yearOf(row.contribution_date) === year && row.type === 'mandal_member')
    .reduce((sum, row) => sum + cents(row.amount), 0);
  const totalFundsCents = openingCents + peopleCents + mandalMemberCents;
  const totalExpensesCents = expenses
    .filter((row) => yearOf(row.expense_date) === year)
    .reduce((sum, row) => sum + cents(row.amount), 0);

  return {
    year,
    initialized,
    initialYear: settings?.initial_year ?? 2025,
    openingBalance: openingCents / 100,
    peopleContributions: peopleCents / 100,
    mandalMemberContributions: mandalMemberCents / 100,
    totalFunds: totalFundsCents / 100,
    totalExpenses: totalExpensesCents / 100,
    currentBalance: (totalFundsCents - totalExpensesCents) / 100,
    closingBalance: (totalFundsCents - totalExpensesCents) / 100,
  };
}

export function addRunningBalances(expenses, totalFunds) {
  let spentCents = 0;
  return sorted(expenses, 'expense_date').map((expense) => {
    spentCents += cents(expense.amount);
    return { ...expense, balance: (cents(totalFunds) - spentCents) / 100 };
  });
}

export { sorted };
