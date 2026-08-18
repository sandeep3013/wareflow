import { OperationalException, ResolutionRecommendation } from '../types/exception';

export interface ResolutionDecisionPlan {
  exceptionId: string;
  recommendedOption: ResolutionRecommendation;
  alternativeOptions: ResolutionRecommendation[];
  decisionRationale: string;
  autoExecutable: boolean;
}

/**
 * Evaluates an operational exception through the EXCEPTION → DECISION → RESOLUTION framework
 * and recommends the highest confidence operational action.
 *
 * @param exception - The active operational exception
 * @returns ResolutionDecisionPlan with scored options and explainable rationale
 *
 * TODO (Future Module):
 * 1. Calculate financial cost of delay vs air freight expediting
 * 2. Auto-execute approved safe resolutions (e.g. inventory cycle count triggers)
 * 3. Log decision history for continuous policy refinement
 */
export function recommendExceptionResolution(
  exception: OperationalException
): ResolutionDecisionPlan | null {
  if (!exception.recommendedResolutions || exception.recommendedResolutions.length === 0) {
    return null;
  }

  const sorted = [...exception.recommendedResolutions].sort(
    (a, b) => b.confidenceScore - a.confidenceScore
  );

  const bestOption = sorted[0];
  const alternatives = sorted.slice(1);

  const decisionRationale = `Recommended action "${bestOption.actionTitle}" with ${bestOption.confidenceScore}% confidence. ${bestOption.impactAssessment}`;

  return {
    exceptionId: exception.id,
    recommendedOption: bestOption,
    alternativeOptions: alternatives,
    decisionRationale,
    autoExecutable: bestOption.confidenceScore >= 95,
  };
}
