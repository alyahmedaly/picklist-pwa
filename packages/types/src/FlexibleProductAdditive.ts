
export interface FlexibleProductAdditive {
  readonly product_id: string;
  readonly e_number?: string;
  readonly additive_name: string;
  readonly functional_category: string;
  readonly dutch_category?: string;
  readonly safety_flags?: string;
  readonly is_natural: boolean;
}
