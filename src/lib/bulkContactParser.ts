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
}

/**
 * Normalizes phone numbers into clean readable strings.
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (!cleaned) return '';

  // If Pakistani format without +, e.g. 923242765621 -> +92 324 2765621
  if (/^92\d{10}$/.test(cleaned)) {
    return `+92 ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  }
  // If 10 digits starting with 3 e.g. 3423326743 -> 0342 3326743
  if (/^3\d{9}$/.test(cleaned)) {
    return `0${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  }
  // If 11 digits starting with 03 e.g. 03423326743 -> 0342 3326743
  if (/^03\d{9}$/.test(cleaned)) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  }

  return cleaned;
}

/**
 * Intelligent local parser that converts messy bulk text into structured lead rows.
 */
export function parseBulkRawContacts(
  rawText: string,
  sourceLabel: string = 'Raw Text Import'
): ParsedLead[] {
  if (!rawText || !rawText.trim()) return [];

  // Normalize line endings
  const text = rawText.replace(/\r\n/g, '\n').trim();

  // 1. Determine splitting strategy
  // Check if double newlines exist (blocks of lines)
  let rawBlocks = text.split(/\n\s*\n+/);

  // If only 1 block was found, check if it's numbered items e.g. "1. ...\n2. ..."
  if (rawBlocks.length === 1 && /\n\s*(?:\d+[\.\)]|\-|\*)\s+/.test(text)) {
    rawBlocks = text.split(/\n\s*(?:\d+[\.\)]|\-|\*)\s+/).filter(b => b.trim());
  }

  // If still 1 block, check if lines contain repeated phone numbers (one lead per line or line-pairs)
  if (rawBlocks.length === 1) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const phoneCount = lines.filter(l => /(?:\+?92|0)?\d{9,12}/.test(l.replace(/\D/g, ''))).length;
    
    // If multiple lines contain phone numbers, partition by phone number boundaries
    if (phoneCount > 1) {
      const reconstructedBlocks: string[] = [];
      let currentChunk: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isPhone = line.replace(/\D/g, '').length >= 9 && line.replace(/\D/g, '').length <= 15;
        currentChunk.push(line);

        // If this line is a rating/notes or phone, and next line looks like a title, end chunk
        const nextLine = lines[i + 1];
        const isRating = /\b[0-5]\.\d(?:\(\d+\))?/.test(line);

        if ((isRating || (isPhone && (!nextLine || !/\b[0-5]\.\d/.test(nextLine)))) && nextLine) {
          reconstructedBlocks.push(currentChunk.join('\n'));
          currentChunk = [];
        }
      }
      if (currentChunk.length > 0) {
        reconstructedBlocks.push(currentChunk.join('\n'));
      }

      if (reconstructedBlocks.length > 1) {
        rawBlocks = reconstructedBlocks;
      }
    }
  }

  const results: ParsedLead[] = [];

  rawBlocks.forEach((block, index) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    let phone = '';
    let email = '';
    let rating = 0;
    let reviewCount = 0;
    let dealValue = 0;
    const notesArr: string[] = [];
    const textLines: string[] = [];

    lines.forEach(line => {
      // Check for email
      const emailMatch = line.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
      if (emailMatch && !email) {
        email = emailMatch[0];
        return;
      }

      // Check for phone number (continuous or formatted)
      // Matches 923242765621, 3423326743, +92 300 1234567, 0321-4567890
      const cleanDigits = line.replace(/[^\d+]/g, '');
      const hasPhoneFormat = /(?:\+?\d{1,4}[\s-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,6}/.test(line);
      const isPurePhoneLine = cleanDigits.length >= 9 && cleanDigits.length <= 15;

      if ((isPurePhoneLine || hasPhoneFormat) && !phone) {
        phone = formatPhoneNumber(line);
        return;
      }

      // Check for Google Maps / Directory Rating: e.g. "4.9(31)" or "4.8 ★ (120 reviews)"
      const ratingMatch = line.match(/\b([0-5]\.\d)\s*(?:\((\d+)\)|\/5|\s*stars?)?/i);
      if (ratingMatch) {
        rating = parseFloat(ratingMatch[1]);
        if (ratingMatch[2]) {
          reviewCount = parseInt(ratingMatch[2], 10);
        }
        notesArr.push(`Rating: ${rating}/5${reviewCount ? ` (${reviewCount} reviews)` : ''}`);
        return;
      }

      // Check for deal budget: e.g. "$45,000", "Rs. 250,000", "PKR 50k"
      const dealMatch = line.match(/(?:[\$£€]|Rs\.?|PKR)\s*(\d[\d,]*\.?\d*)\s*(k|m|million|thousand)?/i);
      if (dealMatch) {
        let val = parseFloat(dealMatch[1].replace(/,/g, ''));
        const multiplier = dealMatch[2]?.toLowerCase();
        if (multiplier === 'k' || multiplier === 'thousand') val *= 1000;
        if (multiplier === 'm' || multiplier === 'million') val *= 1000000;
        if (val > 0) dealValue = Math.round(val);
        return;
      }

      // Remaining line is title, business, or address line
      textLines.push(line);
    });

    // Determine Name and Company from textLines
    let name = '';
    let company = '';

    if (textLines.length > 0) {
      const firstLine = textLines[0];

      // If line contains delimiter like "Artistra | Customized Cakes" or "Apex Corp - John"
      if (firstLine.includes('|')) {
        const parts = firstLine.split('|').map(p => p.trim());
        name = parts[0];
        company = parts.slice(1).join(' | ');
      } else if (firstLine.includes(' - ')) {
        const parts = firstLine.split(' - ').map(p => p.trim());
        name = parts[0];
        company = parts.slice(1).join(' - ');
      } else if (firstLine.includes(':')) {
        const parts = firstLine.split(':').map(p => p.trim());
        name = parts[0];
        company = parts.slice(1).join(': ');
      } else {
        name = firstLine;
        if (textLines.length > 1) {
          company = textLines[1];
        } else {
          company = firstLine;
        }
      }

      // Any additional lines go into notes
      if (textLines.length > 2) {
        notesArr.push(textLines.slice(2).join(' · '));
      }
    } else {
      name = phone ? `Lead (${phone})` : `Lead #${index + 1}`;
      company = 'Direct Lead';
    }

    // Compute Lead Quality Score (Default 50)
    let leadScore = 50;
    if (rating >= 4.7) leadScore = 92;
    else if (rating >= 4.4) leadScore = 80;
    else if (rating > 0) leadScore = 70;
    else if (phone && email) leadScore = 75;
    else if (phone) leadScore = 65;

    results.push({
      id: `parsed-temp-${index}-${Date.now()}`,
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
    });
  });

  return results;
}
