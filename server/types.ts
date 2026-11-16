export type SkillMastery = {
  mastery: number; // 0.0 to 1.0 (P(L))
  halfLifeDays: number; // e.g. 3.0 days initially, grows on review
  lastPracticed: string; // ISO date string
  reviewDue: boolean;
  retention: number; // current calculated retention 0..1
};

export type StudentMisconception = {
  misconceptionId: string;
  conceptKey: string;
  description: string;
  confidence: number; // 0.0 to 1.0
  lastSeen: string;
  evidenceCount: number;
};

export type BanditFormatStats = {
  pulls: number;
  reward: number; // cumulative mastery gain
};

export type TwinState = {
  userId: string;
  skills: Record<string, SkillMastery>;
  misconceptions: StudentMisconception[];
  banditStats: Record<'video' | 'article' | 'practice' | 'worked_example', BanditFormatStats>;
  lastUpdated: string;
  overallReadiness: number; // 0..100
  streakDays: number;
  diagnosedRootCauses: Array<{
    failingConceptKey: string;
    rootConceptKey: string;
    chain: string[];
    misconceptionId?: string;
    daysSaved: number;
  }>;
};

export type Concept = {
  key: string;
  title: string;
  cluster: 'Foundations & Memory' | 'Recursion & Backtracking' | 'Linear Data Structures' | 'Trees & Graphs' | 'Dynamic Programming';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[]; // array of concept keys
  description: string;
  summary: string;
  estimatedMinutes: number;
};

export type QuestionOption = {
  id: string;
  text: string;
  isCorrect: boolean;
  misconceptionId?: string;
  explanation: string;
};

export type Question = {
  id: string;
  conceptKey: string;
  prompt: string;
  codeSnippet?: string;
  options: QuestionOption[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
};

export type Misconception = {
  id: string;
  conceptKey: string;
  title: string;
  description: string;
  fixHint: string;
};

export type ResourceFormat = 'video' | 'article' | 'practice' | 'worked_example';

export type Resource = {
  id: string;
  title: string;
  url: string;
  format: ResourceFormat;
  conceptKeys: string[];
  durationMin: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  authorOrSource: string;
};

export type UserGoal = {
  userId: string;
  domain: string;
  targetProfile: 'Crack Coding Interviews' | 'Master DSA Basics' | 'Python Backend Mastery' | 'Advanced Algorithms';
  deadlineWeeks: number;
  hoursPerWeek: number;
  targetConcepts: string[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: 'student' | 'instructor';
  createdAt: string;
  personaId?: 'aarav' | 'meera' | 'rohan';
};

export type Attempt = {
  id: string;
  userId: string;
  questionId: string;
  conceptKey: string;
  selectedOptionId: string;
  reasoningText?: string;
  detectedMisconceptionId?: string;
  correct: boolean;
  timestamp: string;
  masteryDelta: number;
};

export type PathModule = {
  conceptKey: string;
  title: string;
  cluster: string;
  status: 'mastered' | 'current' | 'upcoming' | 'review_due' | 'blocked';
  estimatedMinutes: number;
  reason: {
    category: 'root_cause' | 'prerequisite_gap' | 'active_misconception' | 'review_decay' | 'goal_target';
    summary: string;
    detail: string;
    inputsUsed: string[];
  };
  recommendedResource: Resource;
  formatBoostPercent: number; // e.g. +14%
  banditScore: number;
};

export type PathDiff = {
  removed: Array<{ conceptKey: string; title: string; reason: string }>;
  added: Array<{ conceptKey: string; title: string; reason: string; priority: 'high' | 'normal' }>;
  reordered: Array<{ conceptKey: string; title: string; oldIndex: number; newIndex: number; reason: string }>;
};

export type PathSnapshot = {
  id: string;
  userId: string;
  createdAt: string;
  modules: PathModule[];
  diffFromPrevious?: PathDiff;
};

export type CandidatePath = {
  id: string;
  label: string;
  description: string;
  weeklyHours: number;
  focusStyle: 'Balanced' | 'Practice Heavy' | 'Paced Mastery';
  predictedReadyDate: string;
  readinessAtDeadline: number;
  weeks: string[];
  p10: number[];
  p50: number[];
  p90: number[];
};

export type CohortMetric = {
  step: number;
  adaptiveMastery: number; // % students reached 85%
  fixedOrderMastery: number;
};

export type CohortSimulationResult = {
  totalStudents: number;
  adaptiveAvgSteps: number;
  fixedAvgSteps: number;
  stepsSavedPercent: number;
  dropoutsPreventedPercent: number;
  history: CohortMetric[];
  distribution: {
    bucket: string;
    adaptive: number;
    fixed: number;
  }[];
};

export type InterestDifficulty = 'foundational' | 'intermediate' | 'advanced';

export type FutureScopeItem = {
  field: string;
  horizon: string;
  outlook: string;
  roles: string[];
  keySkills: string[];
  capstoneIdea: string;
};

export type InterestDomainInfo = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  futureScopes: FutureScopeItem[];
};

export type InterestQuestionOption = {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
};

export type InterestQuestion = {
  id: string;
  interestId: string;
  interestTitle: string;
  difficulty: InterestDifficulty;
  prompt: string;
  contextSnippet?: string;
  options: InterestQuestionOption[];
  cognitiveSignal: string;
  source?: 'curated' | 'gemini';
};

export type ResponseLevelTier =
  | 'Foundational Explorer'
  | 'Applied Builder'
  | 'Systems & Innovation Architect';

export type SuggestedFieldPivot = {
  suggestedField: string;
  suggestedInterestId: string;
  whyThisFitsYourLevel: string;
  futureScopeSummary: string;
  targetRoles: string[];
  bridgeSkills: string[];
  growthHorizon: string;
};

export type InterestEvaluationResult = {
  questionId: string;
  interestTitle: string;
  isCorrect: boolean;
  explanation: string;
  responseScore: number;
  responseLevel: ResponseLevelTier;
  reasoningQuality: string;
  strengthsObserved: string[];
  suggestedPivot: SuggestedFieldPivot;
  evaluatedAt: string;
};

export type UserInterestProfile = {
  userId: string;
  interests: string[];
  customInterest?: string;
  futureScopes: FutureScopeItem[];
  answeredQuestionIds: string[];
  lastEvaluation?: InterestEvaluationResult;
  suggestedPivots: SuggestedFieldPivot[];
  updatedAt: string;
};

