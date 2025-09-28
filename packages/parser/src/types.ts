/**
 * Type definitions for CSV Parser Package
 *
 * These interfaces define the data structures used for parsing CSV files
 * containing Dutch food product data.
 */

/**
 * Type-safe representation of CSV row data for Dutch food products.
 * Supports multiple column naming conventions (PascalCase, camelCase, snake_case).
 */
export interface CSVRow {
  ProductId?: string;
  ProductName?: string;
  PriceRegular?: string;
  PriceSale?: string;
  Category1?: string;
  Category2?: string;
  Category3?: string;
  Category4?: string;
  Category5?: string;
  Category6?: string;
  ProductUnitSize?: string;
  'Energie (kcal)'?: string;
  'Energie (kJ)'?: string;
  Vet?: string;
  'waarvan verzadigd'?: string;
  'waarvan onverzadigd'?: string;
  Koolhydraten?: string;
  'waarvan suikers'?: string;
  Voedingsvezel?: string;
  Eiwitten?: string;
  Zout?: string;
  'Vitamine C'?: string;
  'Kalium/Potassium'?: string;
  'waarvan enkelvoudig onverzadigd'?: string;
  'waarvan meervoudig onverzadigd'?: string;
  Alcohol?: string;
  Calcium?: string;
  'Vitamine B2 / Riboflavine'?: string;
  'Vitamine B12 / Cyano-Cobalamine'?: string;
  Fosfor?: string;
  Ijzer?: string;
  'Vitamine A'?: string;
  'Vitamine D'?: string;
  'Vitamine B11 / Foliumzuur'?: string;
  Jodium?: string;
  'Vitamine E'?: string;
  Linolzuur?: string;
  'Alfa-Linoleenzuur'?: string;
  'Vitamine B3 / Niacine'?: string;
  Magnesium?: string;
  Zink?: string;
  'Omega 3 Vetzuren'?: string;
  'Vitamine B6 / Pyridoxine'?: string;
  'Vitamine B1 / Thiamine'?: string;
  'Vitamine K'?: string;
  'Vitamine B5 / Pantotheenzuur'?: string;
  Koper?: string;
  Natrium?: string;
  'waarvan polyolen'?: string;
  Seleen?: string;
  'Vitamine H / Biotine'?: string;
  'waarvan toegevoegde suikers'?: string;
  'Omega 6 Vetzuren'?: string;
  Folaat?: string;
  Mangaan?: string;
  Chloride?: string;
  Sulfaat?: string;
  Nitraten?: string;
  Bicarbonaat?: string;
  'Siliciumdioxide (Sio2)'?: string;
  Ash?: string;
  Lactose?: string;
  Glucose?: string;
  Maltodextrine?: string;
  'Vitamin D2'?: string;
  'Vitamine B7 / Inositol'?: string;
  Molybdeen?: string;
  'Seleen (Organisch)'?: string;
  Eicosapentaeenzuur?: string;
  Docosahexaeenzuur?: string;
  'waarvan zetmeel'?: string;
  Cholesterol?: string;
  Transvet?: string;
  'Organic Acids, Total'?: string;
  'Ph, Hydrogen Ion Concentration'?: string;
  Fluoride?: string;
  Carnitine?: string;
  Choline?: string;
  Taurine?: string;
  Nucleotide?: string;
  Arachidonzuur?: string;
  'Wei-Eiwit'?: string;
  Caseïne?: string;
  Palmitinezuur?: string;
  'Galactose In Voedingsvezel'?: string;
  'Fructose In Voedingsvezel'?: string;
  Chroom?: string;
  'Tafelzout Gemengd Met Een Kleine Hoeveelheid Van Verschillende Jodiumbevattende Zouten'?: string;
  Betaglucanen?: string;
  'Vitamin A; Calculated By Summation Of The Vitamin A Activities Of Retinol And The Active Carotenoids'?: string;
  'Niacine Equivalent'?: string;
  'Vitamine D3'?: string;
  'Galactooligosaccharides (Gos)'?: string;
  'Vita K-1'?: string;
  Safranal?: string;
  'Omega 9 Vetzuren'?: string;
  'Collageen hydrolysaten'?: string;
  'Plantaardige Eiwitten'?: string;
  'Oligomere proanthocyanidinen (OPC)'?: string;
  Ingredients?: string;
  ContainedAllergens?: string;
  MayContainAllergens?: string;
  NonFoodIngredients?: string;
  ImageLowURL?: string;
  ImageMediumURL?: string;
  ImageHighURL?: string;
}

export type CSVHeader = keyof CSVRow;

/**
 * Result of CSV parsing operation containing headers and data matrix.
 */
export interface ParsedCSVResult {
  /** Column headers from first row */
  headers: string[];
  /** Data rows excluding header (each row is array of cell values) */
  matrix: string[][];
  /** Number of data rows */
  rowCount: number;
}

/**
 * Error types that may be thrown by parser functions.
 */
export interface CSVParseError extends Error {
  /** Error type for categorization */
  type: 'EMPTY_CSV' | 'MALFORMED_CSV' | 'MISSING_HEADERS' | 'INVALID_ROW';
  /** Line number where error occurred (if applicable) */
  line?: number;
  /** Column where error occurred (if applicable) */
  column?: string;
}

/**
 * Configuration options for CSV parsing (future extensibility).
 */
export interface CSVParseOptions {
  /** Skip first row as header (default: false, first row contains headers) */
  skipFirstRow?: boolean;
  /** Delimiter character (default: comma) */
  delimiter?: string;
  /** Handle empty cells as empty strings vs undefined (default: empty strings) */
  emptyAsUndefined?: boolean;
}
