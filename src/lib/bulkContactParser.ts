export interface ParsedLead {
  id: string; // temporary client key
  name: string;
  company: string;
  phone: string;
  email: string;
  deal_value: number;
  lead_score: number;
  source: string;
  status: string;
  pitch_notes: string;
  raw_snippet: string;
  selected: boolean;
  created_at: string;
}

/**
 * Normalizes phone numbers into clean readable strings.
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  // Strip trailing punctuation like "0336 0688786." -> "0336 0688786"
  const cleaned = phone.trim().replace(/[\.\,\;\:\-]+$/, '');
  const digits = cleaned.replace(/[^\d]/g, '');
  if (!digits) return '';

  // If 12 digits starting with 92: 923242765621 -> +92 324 2765621
  if (/^92\d{10}$/.test(digits)) {
    return `+92 ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }
  // If 10 digits starting with 3: 3423326743 -> 0342 3326743
  if (/^3\d{9}$/.test(digits)) {
    return `0${digits.slice(0, 3)} ${digits.slice(3)}`;
  }
  // If 11 digits starting with 03: 03003589513 -> 0300 3589513
  if (/^03\d{9}$/.test(digits)) {
    return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  }
  // If 10 digits landline e.g. 2132790616 -> 021-32790616
  if (/^21\d{8}$/.test(digits)) {
    return `021-${digits.slice(2)}`;
  }

  return cleaned;
}

/**
 * Parses a single row / line that contains multiple tab/space separated fields
 * (e.g. from Google Sheets, Excel, or tabular web listings).
 */
function parseSingleRow(line: string, index: number, sourceLabel: string): ParsedLead | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Skip table header rows if copied from a spreadsheet
  const isHeader =
    /^(name|business|company|contact|title)\b/i.test(trimmed) &&
    /(phone|number|mobile|email|rating|website)/i.test(trimmed);
  if (isHeader) return null;

  let parts: string[] = [];
  if (trimmed.includes('\t')) {
    parts = trimmed.split('\t').map((p) => p.trim()).filter(Boolean);
  } else if (trimmed.includes(' | ') && trimmed.split(' | ').length >= 3) {
    parts = trimmed.split(' | ').map((p) => p.trim()).filter(Boolean);
  } else if (/\s{3,}/.test(trimmed)) {
    parts = trimmed.split(/\s{3,}/).map((p) => p.trim()).filter(Boolean);
  }

  let name = '';
  let company = '';
  let phone = '';
  let email = '';
  let rating = 0;
  let reviewCountStr = '';
  let dealValue = 0;
  const notesArr: string[] = [];

  if (parts.length >= 2) {
    // Column 0 is the Business / Lead Name
    const col0 = parts[0];
    if (col0.includes('|')) {
      const segs = col0.split('|').map((s) => s.trim());
      name = segs[0];
      company = segs.slice(1).join(' | ');
    } else {
      name = col0;
      company = col0;
    }

    // Process remaining columns
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];

      // Check email
      const emailMatch = part.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
      if (emailMatch && !email) {
        email = emailMatch[0];
        continue;
      }

      // Check phone (must have at least 8 digits and look like phone format)
      const cleanDigits = part.replace(/[^\d]/g, '');
      const isPhoneLike =
        cleanDigits.length >= 8 &&
        cleanDigits.length <= 15 &&
        /^[0-9\+\-\s\(\)\.]+$/.test(part);
      if (isPhoneLike && !phone) {
        phone = formatPhoneNumber(part);
        continue;
      }

      // Check rating e.g. "4.9(33)", "4.9(150) · Bakery", "4.2(1.3K)"
      const ratingMatch = part.match(/\b([0-5]\.\d)\s*(?:\(([\d\.]+K?)\))?/i);
      if (ratingMatch && !rating) {
        rating = parseFloat(ratingMatch[1]);
        if (ratingMatch[2]) reviewCountStr = ratingMatch[2];

        let noteText = `Rating: ${rating}/5${reviewCountStr ? ` (${reviewCountStr} reviews)` : ''}`;
        // If category is appended with dot like "· Bakery"
        if (part.includes('·')) {
          const category = part.split('·')[1]?.trim();
          if (category) {
            noteText += ` · ${category}`;
            if (!company || company === name) {
              company = `${name} (${category})`;
            }
          }
        }
        notesArr.push(noteText);
        continue;
      }

      // Check deal budget: e.g. "$45,000", "Rs. 250,000", "PKR 50k"
      const dealMatch = part.match(/(?:[\$£€]|Rs\.?|PKR)\s*(\d[\d,]*\.?\d*)\s*(k|m|million|thousand)?/i);
      if (dealMatch) {
        let val = parseFloat(dealMatch[1].replace(/,/g, ''));
        const multiplier = dealMatch[2]?.toLowerCase();
        if (multiplier === 'k' || multiplier === 'thousand') val *= 1000;
        if (multiplier === 'm' || multiplier === 'million') val *= 1000000;
        if (val > 0) dealValue = Math.round(val);
        continue;
      }

      // Remaining column is notes (e.g. "no website", "server down", "website but only contact info")
      notesArr.push(part);
    }
  } else {
    // Single unseparated line: extract phone and rating using pattern matching
    const phoneRegex = /(?:\+?92[\s-]?)?(?:0?3\d{2}[\s-]?\d{7}|(?:0?21[\s-]?)?\d{8}|\b0?3\d{9}\b|\b92\d{10}\b)/;
    const phoneMatch = trimmed.match(phoneRegex);
    if (phoneMatch) {
      phone = formatPhoneNumber(phoneMatch[0]);
      const beforePhone = trimmed.substring(0, phoneMatch.index).trim();
      const afterPhone = trimmed.substring((phoneMatch.index || 0) + phoneMatch[0].length).trim();
      name = beforePhone || `Lead #${index + 1}`;
      company = name;

      if (afterPhone) {
        const ratingMatch = afterPhone.match(/\b([0-5]\.\d)\s*(?:\(([\d\.]+K?)\))?/i);
        if (ratingMatch) {
          rating = parseFloat(ratingMatch[1]);
          if (ratingMatch[2]) reviewCountStr = ratingMatch[2];
          notesArr.push(`Rating: ${rating}/5${reviewCountStr ? ` (${reviewCountStr} reviews)` : ''}`);
        }
        const cleanNotes = afterPhone.replace(/\b([0-5]\.\d)\s*(?:\(([\d\.]+K?)\))?/i, '').trim();
        if (cleanNotes) notesArr.push(cleanNotes);
      }
    } else {
      name = trimmed;
      company = trimmed;
    }
  }

  // Calculate Lead Quality Score
  let leadScore = 50;
  if (rating >= 4.7) leadScore = 92;
  else if (rating >= 4.4) leadScore = 80;
  else if (rating > 0) leadScore = 70;
  else if (phone && email) leadScore = 75;
  else if (phone) leadScore = 65;

  return {
    id: `parsed-lead-${index}-${Date.now()}`,
    name: name.trim() || `Lead #${index + 1}`,
    company: company.trim() || name.trim(),
    phone: phone || '',
    email: email || '',
    deal_value: dealValue,
    lead_score: leadScore,
    source: sourceLabel,
    status: 'new',
    pitch_notes: notesArr.join(' | ') || '',
    raw_snippet: trimmed,
    selected: true,
    created_at: new Date().toISOString().slice(0, 10),
  };
}

/**
 * Intelligent universal parser that automatically handles:
 * 1. Spreadsheet / Table / TSV / Tab-separated lines (1 lead per line)
 * 2. Multi-line blocks separated by blank lines (Name, Phone, Rating on separate lines)
 * 3. Alternating compact line groups
 */
export function parseBulkRawContacts(
  rawText: string,
  sourceLabel: string = 'Raw Text Import'
): ParsedLead[] {
  if (!rawText || !rawText.trim()) return [];

  // Normalize line endings
  const text = rawText.replace(/\r\n/g, '\n').trim();
  const allLines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (allLines.length === 0) return [];

  // Check if text is row-based (each line is an individual lead)
  const tabLinesCount = allLines.filter((l) => l.includes('\t')).length;
  const phoneRegex = /(?:\+?92[\s-]?)?(?:0?3\d{2}[\s-]?\d{7}|(?:0?21[\s-]?)?\d{8}|\b0?3\d{9}\b|\b92\d{10}\b)/;
  const linesWithPhoneAndText = allLines.filter((l) => {
    const hasPhone = phoneRegex.test(l);
    const hasLetters = /[a-zA-Z\u0600-\u06FF]/.test(l);
    return hasPhone && hasLetters;
  }).length;

  // If at least 30% of lines have tabs or contain both text and phone on the same line,
  // parse each line as an independent tabular lead!
  const isTabularInput =
    tabLinesCount >= Math.max(1, allLines.length * 0.3) ||
    linesWithPhoneAndText >= Math.max(1, allLines.length * 0.3);

  if (isTabularInput) {
    const results: ParsedLead[] = [];
    allLines.forEach((line, idx) => {
      const parsed = parseSingleRow(line, idx, sourceLabel);
      if (parsed) results.push(parsed);
    });
    return results;
  }

  // Otherwise, use block-based multi-line parser
  let rawBlocks = text.split(/\n\s*\n+/);

  // If only 1 block found, check if it's numbered items e.g. "1. ...\n2. ..."
  if (rawBlocks.length === 1 && /\n\s*(?:\d+[\.\)]|\-|\*)\s+/.test(text)) {
    rawBlocks = text.split(/\n\s*(?:\d+[\.\)]|\-|\*)\s+/).filter((b) => b.trim());
  }

  // If still 1 block, partition by phone-only boundaries
  if (rawBlocks.length === 1) {
    const reconstructed: string[] = [];
    let chunk: string[] = [];

    for (let i = 0; i < allLines.length; i++) {
      const line = allLines[i];
      chunk.push(line);
      const isRating = /\b[0-5]\.\d(?:\([\d\.Kk]+\))?/.test(line);
      const isPhoneOnly = /^[0-9\+\-\s\(\)\.]{7,20}$/.test(line);
      const nextLine = allLines[i + 1];

      if ((isRating || isPhoneOnly) && nextLine && !/^[0-9\+\-\s\(\)\.]{7,20}$/.test(nextLine)) {
        reconstructed.push(chunk.join('\n'));
        chunk = [];
      }
    }
    if (chunk.length > 0) reconstructed.push(chunk.join('\n'));
    if (reconstructed.length > 1) rawBlocks = reconstructed;
  }

  const results: ParsedLead[] = [];

  rawBlocks.forEach((block, index) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    // If block is actually a single tabbed row
    if (lines.length === 1 && (lines[0].includes('\t') || phoneRegex.test(lines[0]))) {
      const parsed = parseSingleRow(lines[0], index, sourceLabel);
      if (parsed) results.push(parsed);
      return;
    }

    let phone = '';
    let email = '';
    let rating = 0;
    let reviewCountStr = '';
    let dealValue = 0;
    const notesArr: string[] = [];
    const textLines: string[] = [];

    lines.forEach((line) => {
      // Check email
      const emailMatch = line.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
      if (emailMatch && !email) {
        email = emailMatch[0];
        return;
      }

      // Check phone (continuous or formatted)
      const cleanDigits = line.replace(/[^\d]/g, '');
      const hasPhoneFormat = /(?:\+?\d{1,4}[\s-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,6}/.test(line);
      const isPurePhoneLine = cleanDigits.length >= 8 && cleanDigits.length <= 15 && /^[0-9\+\-\s\(\)\.]+$/.test(line);

      if ((isPurePhoneLine || hasPhoneFormat) && !phone) {
        phone = formatPhoneNumber(line);
        return;
      }

      // Check rating e.g. "4.9(31)" or "4.8 ★ (120 reviews)"
      const ratingMatch = line.match(/\b([0-5]\.\d)\s*(?:\(([\d\.]+K?)\))?/i);
      if (ratingMatch) {
        rating = parseFloat(ratingMatch[1]);
        if (ratingMatch[2]) reviewCountStr = ratingMatch[2];
        notesArr.push(`Rating: ${rating}/5${reviewCountStr ? ` (${reviewCountStr} reviews)` : ''}`);
        return;
      }

      // Check deal budget
      const dealMatch = line.match(/(?:[\$£€]|Rs\.?|PKR)\s*(\d[\d,]*\.?\d*)\s*(k|m|million|thousand)?/i);
      if (dealMatch) {
        let val = parseFloat(dealMatch[1].replace(/,/g, ''));
        const multiplier = dealMatch[2]?.toLowerCase();
        if (multiplier === 'k' || multiplier === 'thousand') val *= 1000;
        if (multiplier === 'm' || multiplier === 'million') val *= 1000000;
        if (val > 0) dealValue = Math.round(val);
        return;
      }

      textLines.push(line);
    });

    let name = '';
    let company = '';

    if (textLines.length > 0) {
      const firstLine = textLines[0];
      if (firstLine.includes('|')) {
        const parts = firstLine.split('|').map((p) => p.trim());
        name = parts[0];
        company = parts.slice(1).join(' | ');
      } else if (firstLine.includes(' - ')) {
        const parts = firstLine.split(' - ').map((p) => p.trim());
        name = parts[0];
        company = parts.slice(1).join(' - ');
      } else {
        name = firstLine;
        company = textLines[1] || firstLine;
      }
      if (textLines.length > 2) {
        notesArr.push(textLines.slice(2).join(' · '));
      }
    } else {
      name = phone ? `Lead (${phone})` : `Lead #${index + 1}`;
      company = 'Direct Lead';
    }

    let leadScore = 50;
    if (rating >= 4.7) leadScore = 92;
    else if (rating >= 4.4) leadScore = 80;
    else if (rating > 0) leadScore = 70;
    else if (phone && email) leadScore = 75;
    else if (phone) leadScore = 65;

    results.push({
      id: `parsed-lead-${index}-${Date.now()}`,
      name: name.trim(),
      company: company.trim() || name.trim(),
      phone: phone || '',
      email: email || '',
      deal_value: dealValue,
      lead_score: leadScore,
      source: sourceLabel,
      status: 'new',
      pitch_notes: notesArr.join(' | ') || '',
      raw_snippet: trimmed,
      selected: true,
      created_at: new Date().toISOString().slice(0, 10),
    });
  });

  return results;
}
