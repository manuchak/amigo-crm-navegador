import { ScoreCalculationResult } from "../types/driver-behavior.types";

/**
 * Calculate driver behavior score category and styling based on score
 * The score is inversely proportional to penalty points - lower penalty points mean better scores
 */
export function calculateScoreCategory(score: number): ScoreCalculationResult['scoreCategory'] {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'fair';
  if (score >= 40) return 'poor';
  return 'critical';
}

/**
 * Get color class for score visualization
 */
export function getScoreColorClass(score: number): string {
  if (score >= 90) return 'bg-green-100 text-green-800 border-green-300';
  if (score >= 75) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (score >= 60) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (score >= 40) return 'bg-orange-50 text-orange-700 border-orange-200';
  return 'bg-red-50 text-red-700 border-red-200';
}

/**
 * Calculate score from penalty points
 * Score is inversely proportional to penalty points with a max score of 100
 */
export function calculateScore(penaltyPoints: number, tripsCount: number): number {
  // Base calculation: 100 - (penaltyPoints / tripsCount * weightFactor)
  const weightFactor = 2; // Adjust based on your business rules
  
  // Calculate raw score
  const rawScore = 100 - ((penaltyPoints / Math.max(1, tripsCount)) * weightFactor);
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, Number(rawScore.toFixed(2))));
}

/**
 * Get full score analysis
 */
export function getScoreAnalysis(penaltyPoints: number, tripsCount: number): ScoreCalculationResult {
  const score = calculateScore(penaltyPoints, tripsCount);
  const scoreCategory = calculateScoreCategory(score);
  const colorClass = getScoreColorClass(score);
  
  return {
    score,
    penaltyPoints,
    scoreCategory,
    colorClass
  };
}

/**
 * Function to calculate driver behavior score category and color
 * Lower score means more penalty points
 */
export function calculateDriverBehaviorScore(score: number): { 
  score: number;
  penaltyPoints: number;
  scoreCategory: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  colorClass: string;
} {
  // Calculate penalty points based on score
  // Lower score means more penalty points
  const penaltyPoints = Math.round((100 - score) * 0.5);
  
  // Determine score category and color class
  if (score >= 90) {
    return {
      score,
      penaltyPoints,
      scoreCategory: 'excellent',
      colorClass: 'bg-green-500 text-white'
    };
  } else if (score >= 80) {
    return {
      score,
      penaltyPoints,
      scoreCategory: 'good',
      colorClass: 'bg-green-400 text-white'
    };
  } else if (score >= 70) {
    return {
      score,
      penaltyPoints,
      scoreCategory: 'fair',
      colorClass: 'bg-yellow-500 text-white'
    };
  } else if (score >= 60) {
    return {
      score,
      penaltyPoints,
      scoreCategory: 'poor',
      colorClass: 'bg-orange-500 text-white'
    };
  } else {
    return {
      score,
      penaltyPoints,
      scoreCategory: 'critical',
      colorClass: 'bg-red-500 text-white'
    };
  }
}
