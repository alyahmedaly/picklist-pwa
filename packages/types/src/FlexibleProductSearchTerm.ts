import type { SearchTermType } from "./SearchTermType.ts";


export interface FlexibleProductSearchTerm {
  readonly product_id: string;
  readonly term: string;
  readonly term_type: SearchTermType;
  readonly weight: number;
  readonly language: 'nl' | 'en';
}
