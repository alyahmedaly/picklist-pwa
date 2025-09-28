export interface ScoreDistribution {
  gradeCount: { A: number; B: number; C: number; D: number; E: number; };
  total: number;
  distribution: { A: number; B: number; C: number; D: number; E: number; };
}
