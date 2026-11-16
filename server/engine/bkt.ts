/**
 * @license
 * Bayesian Knowledge Tracing (BKT) Engine
 * 
 * Standard Corbett & Anderson formulation:
 * - P(L_0): Initial probability of student knowing the skill
 * - P(T): Transition probability (probability of learning the skill during an opportunity)
 * - P(G): Probability of guessing correctly without knowing the skill
 * - P(S): Probability of slipping (making an error despite knowing the skill)
 * 
 * After an observation (correct or incorrect):
 * 1. Posterior update:
 *    P(L_t | Correct) = (P(L_{t-1}) * (1 - P(S))) / (P(L_{t-1}) * (1 - P(S)) + (1 - P(L_{t-1})) * P(G))
 *    P(L_t | Incorrect) = (P(L_{t-1}) * P(S)) / (P(L_{t-1}) * P(S) + (1 - P(L_{t-1})) * (1 - P(G)))
 * 
 * 2. Learning transition:
 *    P(L_{t+1}) = P(L_t | Obs) + (1 - P(L_t | Obs)) * P(T)
 */

export interface BKTParameters {
  pInit: number;  // P(L_0)
  pLearn: number; // P(T)
  pGuess: number; // P(G)
  pSlip: number;  // P(S)
}

// Default empirically calibrated parameters for DSA concepts
export const DEFAULT_BKT_PARAMS: BKTParameters = {
  pInit: 0.20,
  pLearn: 0.18,
  pGuess: 0.15,
  pSlip: 0.10,
};

/**
 * Updates mastery probability after an observed practice response.
 * @param priorMastery P(L_{t-1}) current mastery estimate in [0, 1]
 * @param isCorrect Whether the student's answer was correct
 * @param params Custom or default BKT parameters
 * @returns Posterior mastery P(L_{t+1}) in [0, 1]
 */
export function updateMasteryBKT(
  priorMastery: number,
  isCorrect: boolean,
  params: BKTParameters = DEFAULT_BKT_PARAMS
): { newMastery: number; posterior: number; delta: number } {
  // Clamp prior to valid probability interval [0.01, 0.99] to prevent mathematical lock-in
  const pL = Math.max(0.01, Math.min(0.99, priorMastery));
  const { pLearn, pGuess, pSlip } = params;

  let posterior: number;

  if (isCorrect) {
    const numerator = pL * (1 - pSlip);
    const denominator = numerator + (1 - pL) * pGuess;
    posterior = denominator > 0 ? numerator / denominator : pL;
  } else {
    const numerator = pL * pSlip;
    const denominator = numerator + (1 - pL) * (1 - pGuess);
    posterior = denominator > 0 ? numerator / denominator : pL;
  }

  // Next step transition: probability of knowing it at t+1 given opportunity to learn
  const newMastery = posterior + (1 - posterior) * pLearn;

  // Final bounded clamping
  const boundedMastery = Math.round(Math.max(0.02, Math.min(0.98, newMastery)) * 1000) / 1000;
  const delta = Math.round((boundedMastery - priorMastery) * 1000) / 1000;

  return {
    newMastery: boundedMastery,
    posterior: Math.round(posterior * 1000) / 1000,
    delta,
  };
}
