// Flexible schema entity and enum types


export interface FlexibleProduct {
  readonly id: string;
  readonly name: string;
  readonly price_regular: number;
  readonly price_sale?: number;
  readonly unit_amount: number;
  readonly unit_type: 'g' | 'ml' | 'pieces' | 'kg' | 'l';
  readonly brand?: string;
  readonly created_at: number;
  readonly updated_at: number;
}
