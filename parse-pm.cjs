// parse-pm.cjs - Converts extracted FM PDF text to structured JSON
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'src/data/fm-prehospitala-2025.txt');
const outputPath = path.join(__dirname, 'src/data/fm-prehospitala-2025.json');

const rawText = fs.readFileSync(inputPath, 'utf8');
const rawLines = rawText.split('\n');

// =============================================================================
// Step 1: Reconstruct logical lines from PDF column-layout OCR artifacts
// The PDF two-column layout causes: [word-end-A] + 20+SPACES + [word-start-B]
// =============================================================================

function reconstructLines(rawLines) {
  const result = [];
  let pending = '';

  const flush = () => {
    const t = pending.trim();
    if (t) result.push(t);
    pending = '';
  };

  for (const raw of rawLines) {
    const colBreakMatch = raw.match(/^(.*?) {20,}(.*)$/);

    if (colBreakMatch) {
      const leftCont = colBreakMatch[1];
      const rightStart = colBreakMatch[2].trim();
      // Append leftCont to pending. If pending ends with a space or leftCont starts
      // with a space, it's a word boundary. If pending ends with a letter and leftCont
      // starts with a letter, it's a split word (no space needed).
      if (pending.endsWith(' ') || leftCont.startsWith(' ')) {
        pending += leftCont.trim();
      } else if (pending.length > 0 && leftCont.length > 0) {
        // Both end/start with letters — could be split word or separate words.
        // Heuristic: if leftCont is short (<= 8 chars), it's likely a word continuation.
        // Otherwise add a space.
        if (leftCont.trim().length <= 8) {
          pending += leftCont.trim();
        } else {
          pending += ' ' + leftCont.trim();
        }
      } else {
        pending += leftCont;
      }
      flush();
      pending = rightStart;
    } else {
      const trimmed = raw.trim();
      if (trimmed === '') {
        flush();
        result.push('');
      } else {
        // Normal line - always start a new logical line (word splits only happen at column breaks)
        flush();
        pending = trimmed;
      }
    }
  }
  flush();
  return result;
}

const cleanedLines = reconstructLines(rawLines);

// =============================================================================
// Step 2: Identify TOC section
// =============================================================================

const H2_KEYWORDS = [
  'Symtom och kliniska fynd',
  'Behandling/åtgärd',
  'Observera',
  'Evakuering',
  'Aspekter vid fördröjd avtransport',
  'Vård vid fördröjd avtransport',
  'Bakgrund',
  'Grundprinciper',
  'Anamnes',
  'I praktiken:',
  'Differentialdiagnoser',
  'Indikationer',
  'Kontraindikationer',
  'Dosering',
  'Biverkningar',
  'Farmakokinetik',
  'Verkningsmekanism',
  'Beredning',
  'Förpackning',
  'Viktiga interaktioner',
  'Speciella patientgrupper',
  'Överväganden vid CBRN-händelse',
  'Undersökning',
  'Behandling/åtgärd för dykare',
  'Behandling/åtgärd för piloter',
];

function isH2(line) {
  return H2_KEYWORDS.some(kw => line === kw || line.startsWith(kw + ' ') || line.startsWith(kw + ':'));
}

let tocEntries = new Set();
let tocEndIndex = 0;

for (let j = 0; j < cleanedLines.length; j++) {
  const l = cleanedLines[j].trim();
  if (l === '') continue;
  // TOC ends when we hit actual body content: bullets or long lines (>100 chars)
  if (l.startsWith('•') || l.startsWith('- ') || l.length > 100) {
    tocEndIndex = j;
    break;
  }
  if (l.length > 0) tocEntries.add(l);
}

console.log(`TOC entries found: ${tocEntries.size}, content starts at line ${tocEndIndex}`);
console.log('Sample TOC:', [...tocEntries].slice(0, 5));

// =============================================================================
// Step 3: Parse content lines
// =============================================================================

const entries = [];

for (let j = tocEndIndex; j < cleanedLines.length; j++) {
  const line = cleanedLines[j].trim();
  if (line === '') continue;

  if (isH2(line)) { entries.push({ type: 'h2', text: line }); continue; }
  if (line.startsWith('•')) { entries.push({ type: 'bullet', text: line.replace(/^•\s*/, '') }); continue; }
  if (line.startsWith('- ')) { entries.push({ type: 'bullet2', text: line.replace(/^-\s*/, '') }); continue; }
  if (tocEntries.has(line)) { entries.push({ type: 'h1', text: line }); continue; }

  entries.push({ type: 'body', text: line });
}

// =============================================================================
// Step 4: Merge consecutive body entries into paragraphs
// =============================================================================

const merged = [];
let bodyBuf = [];

// Drop everything before the first h1
const firstH1 = entries.findIndex(e => e.type === 'h1');
const trimmedEntries = firstH1 >= 0 ? entries.slice(firstH1) : entries;

const flushBody = () => {
  if (bodyBuf.length > 0) {
    merged.push({ type: 'body', text: bodyBuf.join(' ').replace(/\s+/g, ' ').trim() });
    bodyBuf = [];
  }
};

for (const entry of trimmedEntries) {
  if (entry.type === 'body') {
    bodyBuf.push(entry.text);
  } else {
    flushBody();
    merged.push(entry);
  }
}
flushBody();

// =============================================================================
// Step 5: Write JSON + stats
// =============================================================================

fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2), 'utf8');
console.log(`\nWritten ${merged.length} entries`);
const counts = {};
for (const e of merged) counts[e.type] = (counts[e.type] || 0) + 1;
console.log('Counts:', counts);

console.log('\nFirst 25 entries:');
merged.slice(0, 25).forEach((e, i) => console.log(`[${i}] ${e.type}: ${e.text.substring(0, 90)}`));

console.log('\nSample body (first 5):');
merged.filter(e => e.type === 'body').slice(0, 5).forEach(e => console.log('  BODY:', e.text.substring(0, 150)));
