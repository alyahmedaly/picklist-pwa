
export interface SparsityAnalysis {
  totalColumns: number;
  emptyColumns: string[];
  sparsityThreshold: number;
  recommendedExclusions: string[];
}
