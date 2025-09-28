export interface PostWorkoutFilterCriteria {
  minRatio: number;
  maxRatio: number;
  preferHighGI?: boolean;
  recoveryWindow?: 'immediate' | 'moderate' | 'extended';
}
