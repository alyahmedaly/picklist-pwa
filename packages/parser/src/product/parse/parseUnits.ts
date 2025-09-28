import type { UnitInfo } from '@picklist/types';

/**
 * parseUnits (T009) – Extract pack count & canonical amount (ml/g) from raw string.
 * Patterns handled:
 *  - Multipack:  /^(\d+)\s*[xX]\s*([0-9.,]+)\s*([a-zA-Z]+)/
 *  - Single size: /^([0-9.,]+)\s*([a-zA-Z]+)/
 *  - Count-only (language variants e.g., stuks, pcs, Stück, piezas): /^(\d+)\s*(stuks?|pcs?|stück|piezas?)$/i
 * Normalization:
 *  - Decimal comma -> dot
 *  - l/L -> ml ( * 1000 )
 *  - kg -> g ( * 1000 )
 *  - ml/g remain
 * Returns minimal UnitInfo fields; always includes raw.
 */
export function parseUnits(
  raw: string | undefined | null,
  statsAccumulator?: { incrementDecimalCommaNormalized(): void },
): UnitInfo | undefined {
  if (!raw) return undefined;
  const original = raw;
  const s = raw.trim();
  if (!s) return { raw: original };

  // Count-only patterns (pack count without size)
  const countOnly = /^(\d+)\s*(stuks?|pcs?|stück|piezas?)$/i.exec(s);
  if (countOnly) {
    return { raw: original, packCount: Number(countOnly[1]) };
  }

  // Multipack with inequality pattern (e.g., "6 x < 0,33 l")
  const multiInequality = /^(\d+)\s*[xX]\s*[<≤]\s*([0-9.,]+)\s*([a-zA-Z]+)\b/.exec(
    s.replace(/\s+/g, ' '),
  );
  if (multiInequality) {
    const pack = Number(multiInequality[1]);
    const num = normalizeDecimalComma(multiInequality[2], statsAccumulator);
    const unit = normalizeUnit(multiInequality[3]);
    const { amount, amountUnit } = convertToCanonical(num, unit);
    return { raw: original, packCount: pack, amount, amountUnit };
  }

  // Multipack pattern
  const multi = /^(\d+)\s*[xX]\s*([0-9.,]+)\s*([a-zA-Z]+)\b/.exec(s.replace(/\s+/g, ' '));
  if (multi) {
    const pack = Number(multi[1]);
    const num = normalizeDecimalComma(multi[2], statsAccumulator);
    const unit = normalizeUnit(multi[3]);
    const { amount, amountUnit } = convertToCanonical(num, unit);
    return { raw: original, packCount: pack, amount, amountUnit };
  }

  // Single size with inequality (e.g., "< 0,01 g", "≤ 1,5 g")
  const singleInequality = /^[<≤]\s*([0-9.,]+)\s*([a-zA-Z]+)\b/.exec(s);
  if (singleInequality) {
    const num = normalizeDecimalComma(singleInequality[1], statsAccumulator);
    const unit = normalizeUnit(singleInequality[2]);
    const { amount, amountUnit } = convertToCanonical(num, unit);
    return { raw: original, amount, amountUnit };
  }

  // Single size
  const single = /^([0-9.,]+)\s*([a-zA-Z]+)\b/.exec(s);
  if (single) {
    const num = normalizeDecimalComma(single[1], statsAccumulator);
    const unit = normalizeUnit(single[2]);
    const { amount, amountUnit } = convertToCanonical(num, unit);
    return { raw: original, amount, amountUnit };
  }

  // Fallback: just raw
  return { raw: original };
}

// Shared decimal comma normalization helper
export function normalizeDecimalComma(
  txt: string,
  statsAccumulator?: { incrementDecimalCommaNormalized(): void },
): number {
  const hasDecimalComma = /\d,\d/.test(txt);
  // Replace decimal comma with dot, remove thousands separators if later added.
  const cleaned = txt.replace(/,/g, '.');
  const n = Number(cleaned);

  // Track conversions for statistics
  if (hasDecimalComma && isFinite(n) && statsAccumulator) {
    statsAccumulator.incrementDecimalCommaNormalized();
  }

  return isFinite(n) ? n : NaN;
}

function normalizeUnit(u: string): string {
  return u.toLowerCase();
}

function convertToCanonical(
  amount: number,
  unit: string,
): { amount?: number; amountUnit?: string } {
  if (!isFinite(amount)) return {};
  switch (unit) {
    case 'l':
    case 'lt':
    case 'liter':
    case 'litre':
      return { amount: amount * 1000, amountUnit: 'ml' };
    case 'ml':
      return { amount, amountUnit: 'ml' };
    case 'kg':
      return { amount: amount * 1000, amountUnit: 'g' };
    case 'g':
      return { amount, amountUnit: 'g' };
    default:
      // Unknown unit: leave unconverted but record raw unit? (Spec: only canonical units needed.)
      return { amount, amountUnit: unit };
  }
}
