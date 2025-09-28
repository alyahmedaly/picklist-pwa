import type { CSVRow } from '../../types.ts';

const isEmptyValue = (val: unknown) => {
  if (val === 'NA') return true; // Common CSV export artifact
  return (
    val === null ||
    val === undefined ||
    String(val).trim() === '' ||
    String(val).toUpperCase() === 'NA'
  );
};

export interface Price {
  regular: number;
  sale?: number;
  currency: string;
}

export function parsePrice(csvRow: CSVRow): Price {
  const priceSaleRaw = csvRow.PriceSale;
  const priceSale =
    priceSaleRaw !== undefined && !isEmptyValue(priceSaleRaw)
      ? parseFloat(priceSaleRaw)
      : undefined;

  return {
    regular: parseFloat(csvRow.PriceRegular || '0') || 0,
    sale: priceSale,
    currency: 'EUR',
  };
}
