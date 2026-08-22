import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { addRunningBalances, calculateOverview, sorted } from './finance.js';

const CONTRIBUTION_FIELDS = 'contribution_date,name,amount,type,created_at,id';
const EXPENSE_FIELDS = 'expense_date,purpose,amount,created_at,id';

export async function loadExportData(supabaseAdmin, year) {
  const start = `${year}-01-01`;
  const end = `${year + 1}-01-01`;
  const [settingsResult, previousContributionsResult, previousExpensesResult, contributionsResult, expensesResult] = await Promise.all([
    supabaseAdmin.from('financial_settings').select('*').eq('id', true).maybeSingle(),
    supabaseAdmin.from('financial_contributions').select('amount,contribution_date').lt('contribution_date', start),
    supabaseAdmin.from('financial_expenses').select('amount,expense_date').lt('expense_date', start),
    supabaseAdmin.from('financial_contributions').select(CONTRIBUTION_FIELDS).gte('contribution_date', start).lt('contribution_date', end),
    supabaseAdmin.from('financial_expenses').select(EXPENSE_FIELDS).gte('expense_date', start).lt('expense_date', end),
  ]);
  
  const failure = [settingsResult, previousContributionsResult, previousExpensesResult, contributionsResult, expensesResult]
    .find((result) => result.error)?.error;
  if (failure) throw failure;

  const contributions = [...(previousContributionsResult.data || []), ...(contributionsResult.data || [])];
  const expenses = [...(previousExpensesResult.data || []), ...(expensesResult.data || [])];
  const overview = calculateOverview({ settings: settingsResult.data, contributions, expenses, year });
  
  return {
    overview,
    contributions: sorted(contributionsResult.data || [], 'contribution_date'),
    expenses: addRunningBalances(sorted(expensesResult.data || [], 'expense_date'), overview.totalFunds),
  };
}

/* =========================================================
   CSV EXPORTS - With Summary Blocks
   ========================================================= */

function amount(value) {
  return Number(value || 0).toFixed(2);
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function csvRow(values) {
  return values.map(csvCell).join(',');
}

export function fundsCsv({ overview, contributions }) {
  const rows = [
    ['Year', overview.year],
    ['Opening Balance', amount(overview.openingBalance)],
    ['Total Contributions', amount(overview.peopleContributions + overview.mandalMemberContributions)],
    ['Total Funds', amount(overview.totalFunds)],
    [], // Empty row to separate summary from table
    ['Date', 'Name', 'Amount', 'Category'],
    ...contributions.map((row) => [
      row.contribution_date, 
      row.name, 
      amount(row.amount), 
      row.type === 'people' ? 'People' : 'Mandal Member'
    ]),
  ];
  if (!contributions.length) rows.push(['No contributions recorded', '', '', '']);
  return `\ufeff${rows.map(csvRow).join('\r\n')}\r\n`;
}

export function expensesCsv({ overview, expenses }) {
  const rows = [
    ['Year', overview.year],
    ['Total Funds', amount(overview.totalFunds)],
    ['Total Expenses', amount(overview.totalExpenses)],
    ['Current Balance', amount(overview.currentBalance)],
    [], // Empty row to separate summary from table
    ['Date', 'Purpose', 'Amount', 'Balance'],
    ...expenses.map((row) => [
      row.expense_date, 
      row.purpose, 
      amount(row.amount), 
      amount(row.balance)
    ]),
  ];
  if (!expenses.length) rows.push(['No expenses recorded', '', '', '']);
  return `\ufeff${rows.map(csvRow).join('\r\n')}\r\n`;
}

/* =========================================================
   PDF EXPORTS - Official Document Styling
   ========================================================= */

function inr(value) {
  return Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function dateLabel(value) {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

// Draw Dashboard-style Summary Cards
function drawSummaryCards(doc, metrics) {
  const cardWidth = 140;
  const cardHeight = 50;
  const spacing = 20;
  let startX = 48;
  const startY = doc.y;

  metrics.forEach((metric) => {
    // Card Border
    doc.lineWidth(1).strokeColor('#e5e7eb').rect(startX, startY, cardWidth, cardHeight).stroke();
    // Label
    doc.fillColor('#6b7280').font('Helvetica-Bold').fontSize(9).text(metric.label, startX + 12, startY + 12);
    // Value
    doc.fillColor('#831843').font('Helvetica-Bold').fontSize(14).text(`INR ${metric.value}`, startX + 12, startY + 28);
    
    startX += cardWidth + spacing;
  });
  doc.y = startY + cardHeight + 30; // Move cursor below cards
}

// Draw Table with strict Y-axis alignment
function writeTable(doc, headers, rows, widths, aligns) {
  const left = 48;
  const tableWidth = widths.reduce((sum, w) => sum + w, 0);
  
  const drawHeader = () => {
    if (doc.y > doc.page.height - 100) doc.addPage();
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#831843');
    
    const startY = doc.y; // Lock the Y position for the entire header row
    let x = left;
    
    headers.forEach((header, index) => { 
      doc.text(header, x, startY, { width: widths[index], align: aligns[index] }); 
      x += widths[index]; 
    });
    
    doc.y = startY + 14;
    // Thick header border
    doc.lineWidth(1.5).strokeColor('#831843').moveTo(left, doc.y).lineTo(left + tableWidth, doc.y).stroke();
    doc.y += 10;
  };

  drawHeader();
  doc.font('Helvetica').fontSize(10).fillColor('#374151');

  rows.forEach((row) => {
    if (doc.y > doc.page.height - 60) { doc.addPage(); drawHeader(); }
    
    const currentY = doc.y; // Lock the Y position for the entire data row
    let x = left;
    
    row.forEach((cell, index) => { 
      doc.text(String(cell), x, currentY, { width: widths[index], align: aligns[index], ellipsis: true }); 
      x += widths[index]; 
    });
    
    doc.y = currentY + 16;
    // Light gray horizontal line for every row
    doc.lineWidth(0.5).strokeColor('#e5e7eb').moveTo(left, doc.y).lineTo(left + tableWidth, doc.y).stroke();
    doc.y += 8;
  });
}

export function financialPdf({ kind, overview, contributions, expenses }) {
  const doc = new PDFDocument({ size: 'A4', margin: 48, bufferPages: true });
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  const done = new Promise((resolve, reject) => { doc.on('end', () => resolve(Buffer.concat(chunks))); doc.on('error', reject); });

  /* --- 1. LETTERHEAD WITH LOGO --- */
  const logoPath = path.resolve('./src/Assets/Logo.png');
  const hasLogo = fs.existsSync(logoPath);
  
  if (hasLogo) {
    // Increased logo size from 55 to 75
    doc.image(logoPath, 48, 35, { width: 75 });
  }

  const textX = hasLogo ? 140 : 48; // Shifted text further right to accommodate larger logo

  doc.fillColor('#831843') // Maroon
     .font('Helvetica-Bold')
     .fontSize(22)
     .text('SHRI GANESH MITRA MANDAL', textX, 48); // Forced start Y to align with logo

  doc.fillColor('#ca8a04') // Gold
     .font('Helvetica-Bold')
     .fontSize(12)
     .text('Est. 2024', textX, doc.y + 4); 

  doc.fillColor('#6b7280') // Gray
     .font('Helvetica')
     .fontSize(12)
     .text(`${kind === 'funds' ? 'Financial Statement' : 'Expense Statement'} - Year ${overview.year}`, textX, doc.y + 8);

  doc.moveDown(3);

  /* --- 2. SUMMARY CARDS --- */
  if (kind === 'funds') {
    drawSummaryCards(doc, [
      { label: 'Opening Balance', value: inr(overview.openingBalance) },
      { label: 'Total Contributions', value: inr(overview.peopleContributions + overview.mandalMemberContributions) },
      { label: 'Total Funds', value: inr(overview.totalFunds) }
    ]);
  } else {
    drawSummaryCards(doc, [
      { label: 'Total Funds', value: inr(overview.totalFunds) },
      { label: 'Total Expenses', value: inr(overview.totalExpenses) },
      { label: 'Current Balance', value: inr(overview.currentBalance) }
    ]);
  }

  /* --- 3. DATA TABLES --- */
  if (kind === 'funds') {
    const types = ['people', 'mandal_member'];
    types.forEach((type, idx) => {
      const title = type === 'people' ? 'CONTRIBUTION FROM PEOPLE' : 'CONTRIBUTION FROM MANDAL MEMBERS';
      const rows = contributions.filter((row) => row.type === type).map((row) => [dateLabel(row.contribution_date), row.name, inr(row.amount)]);
      
      doc.fillColor('#831843').font('Helvetica-Bold').fontSize(14).text(title, 48, doc.y);
      doc.moveDown(0.5);
      
      if (rows.length) {
        writeTable(doc, ['Date', 'Name', 'Amount (INR)'], rows, [100, 250, 145], ['left', 'left', 'right']);
      } else {
        doc.fillColor('#6b7280').font('Helvetica').fontSize(10).text('No contributions recorded.', 48, doc.y);
      }
      
      if (idx < types.length - 1) {
        doc.moveDown(2);
      }
    });
  } else {
    doc.fillColor('#831843').font('Helvetica-Bold').fontSize(14).text('EXPENSES RECORD', 48, doc.y);
    doc.moveDown(0.5);
    
    if (expenses.length) {
      writeTable(doc, ['Date', 'Purpose', 'Amount (INR)', 'Balance (INR)'], 
        expenses.map((row) => [dateLabel(row.expense_date), row.purpose, inr(row.amount), inr(row.balance)]), 
        [80, 195, 110, 110], ['left', 'left', 'right', 'right']);
    } else {
      doc.fillColor('#6b7280').font('Helvetica').fontSize(10).text('No expenses recorded.', 48, doc.y);
    }
  }

  /* --- 4. GLOBAL HEADER & FOOTER --- */
  const range = doc.bufferedPageRange();
  
  // Temporarily remove bottom margin to draw footers without triggering a new page
  const originalBottomMargin = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;

  for (let i = range.start, end = range.start + range.count, page = 1; i < end; i++, page++) {
    doc.switchToPage(i);
    doc.font('Helvetica').fontSize(8).fillColor('#9ca3af');
    
    const rightMargin = 48;
    const contentWidth = doc.page.width - rightMargin * 2;

    // Top Right: Generated Date 
    doc.text(
      `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
      rightMargin,
      20,
      {
        width: contentWidth,
        align: 'right',
        lineBreak: false,
      }
    );
    
    // Bottom Right: Page numbers
    doc.text(
      `Page ${page} of ${range.count}`,
      rightMargin,
      doc.page.height - 30,
      {
        width: contentWidth,
        align: 'right',
        lineBreak: false,
      }
    );
  }

  // Restore margin before ending
  doc.page.margins.bottom = originalBottomMargin;

  doc.end();
  return done;
}