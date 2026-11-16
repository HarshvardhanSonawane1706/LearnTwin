/**
 * @license
 * LearnTwin REST API Endpoints
 */

import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { dbStore } from './store.js';
import { updateMasteryBKT } from './engine/bkt.js';
import { updateMisconceptionBelief, getActiveMisconceptions } from './engine/misconceptions.js';
import { evaluateSkillDecay, consolidateMemory } from './engine/decay.js';
import { traceRootCause } from './engine/rootCause.js';
import { updateBanditStats, scoreResourceWithBandit } from './engine/bandit.js';
import { generateAdaptivePath } from './engine/pathGenerator.js';
import { computePathDiff } from './engine/pathDiff.js';
import { runMonteCarloSimulation } from './engine/monteCarlo.js';
import { runCohortSimulation } from './engine/cohortSimulation.js';
import {
  classifyMisconceptionReasoning,
  generateRecommendationExplanation,
  evaluateExplainBack,
  generateInterestQuestionWithGemini,
  refineInterestPivotWithGemini,
} from './gemini.js';
import {
  INTEREST_CATALOG,
  INTEREST_QUESTIONS,
  getFutureScopesForInterests,
  pickRandomInterestQuestion,
  evaluateInterestResponseDeterministic,
  getInterestDomain,
} from './engine/interestScope.js';
import { Attempt, PathSnapshot, TwinState, User } from './types.js';

export const apiRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'learntwin-dev-secret-key-2026';

function sanitizeUser(user: User): Omit<User, 'passwordHash'> {
  const { passwordHash: _omitted, ...safeUser } = user;
  return safeUser;
}

// Strict helper: requires valid Bearer JWT and existing user; never falls back to a demo persona
function requireAuthUserId(req: Request, res: Response): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    if (decoded?.userId && dbStore.getUser(decoded.userId)) {
      return decoded.userId;
    }
  } catch {
    // invalid token
  }

  res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  return null;
}

// ------------------------------------------
// 1. HEALTH & SYSTEM STATUS
// ------------------------------------------
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json(dbStore.getHealth());
});

// ------------------------------------------
// 2. AUTH & PERSONAS
// ------------------------------------------
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const schema = z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    email: z.string().trim().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  });
  const parse = schema.safeParse(req.body);
  if (!parse.success) {
    const firstError = parse.error.issues[0]?.message || 'Invalid input fields';
    return res.status(400).json({ error: firstError, details: parse.error.format() });
  }

  const { name, email, password } = parse.data;
  const normalizedEmail = email.toLowerCase();
  if (dbStore.findUserByEmail(normalizedEmail)) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const newUser: User = {
    id: userId,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: 'student',
    createdAt: new Date().toISOString(),
  };

  const savedUser = dbStore.saveUser(newUser);
  const goal = dbStore.getGoal(userId);
  const twin = dbStore.getTwin(userId);

  const initialModules = generateAdaptivePath(
    dbStore.getAllConcepts(),
    dbStore.getAllResources(),
    twin,
    goal
  );
  dbStore.saveSnapshot(userId, {
    id: `snap_${Date.now()}`,
    userId,
    createdAt: new Date().toISOString(),
    modules: initialModules,
  });

  const interestProfile = dbStore.getInterestProfile(userId);
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: sanitizeUser(savedUser), twin, goal, interestProfile });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const schema = z.object({
    email: z.string().trim().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  });
  const parse = schema.safeParse(req.body);
  if (!parse.success) {
    const firstError = parse.error.issues[0]?.message || 'Invalid login credentials format';
    return res.status(400).json({ error: firstError });
  }

  const { email, password } = parse.data;
  const user = dbStore.findUserByEmail(email);
  if (!user || !user.passwordHash || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const twin = dbStore.getTwin(user.id);
  const goal = dbStore.getGoal(user.id);
  const interestProfile = dbStore.getInterestProfile(user.id);
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: sanitizeUser(user), twin, goal, interestProfile });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const userId = requireAuthUserId(req, res);
  if (!userId) return;

  const user = dbStore.getUser(userId)!;
  const twin = dbStore.getTwin(user.id);
  const goal = dbStore.getGoal(user.id);
  const interestProfile = dbStore.getInterestProfile(user.id);
  return res.json({ user: sanitizeUser(user), twin, goal, interestProfile });
});

// One-click demo persona switch (explicit user action only)
apiRouter.get('/auth/demo/:persona', (req: Request, res: Response) => {
  const personaParam = req.params.persona.toLowerCase();
  const personaId = `usr_${personaParam}`;
  const user = dbStore.getUser(personaId);

  if (!user) {
    return res.status(404).json({ error: `Persona ${personaParam} not found. Available: aarav, meera, rohan` });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  const twin = dbStore.getTwin(user.id);
  const goal = dbStore.getGoal(user.id);
  const interestProfile = dbStore.getInterestProfile(user.id);

  res.json({
    token,
    user: sanitizeUser(user),
    twin,
    goal,
    interestProfile,
  });
});

// ------------------------------------------
// 3. GOALS
// ------------------------------------------
apiRouter.get('/goal', (req: Request, res: Response) => {
  const userId = requireAuthUserId(req, res); if (!userId) return;
  res.json(dbStore.getGoal(userId));
});

apiRouter.put('/goal', (req: Request, res: Response) => {
  const userId = requireAuthUserId(req, res); if (!userId) return;
  const schema = z.object({
    domain: z.string().optional(),
    targetProfile: z.enum(['Crack Coding Interviews', 'Master DSA Basics', 'Python Backend Mastery', 'Advanced Algorithms']).optional(),
    deadlineWeeks: z.number().min(1).max(52).optional(),
    hoursPerWeek: z.number().min(1).max(40).optional(),
    targetConcepts: z.array(z.string()).optional(),
  });

  const parse = schema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid goal parameters', details: parse.error.format() });
  }

  const updated = dbStore.updateGoal(userId, parse.data);

  // Automatically regenerate path snapshot after goal change
  const allConcepts = dbStore.getAllConcepts();
  const resources = dbStore.getAllResources();
  const twin = dbStore.getTwin(userId);
  const newModules = generateAdaptivePath(allConcepts, resources, twin, updated);

  const prevSnapshot = dbStore.getLatestSnapshot(userId);
  const diff = prevSnapshot ? computePathDiff(prevSnapshot.modules, newModules) : undefined;

  const newSnapshot: PathSnapshot = {
    id: `snap_${Date.now()}`,
    userId,
    createdAt: new Date().toISOString(),
    modules: newModules,
    diffFromPrevious: diff,
  };
  dbStore.saveSnapshot(userId, newSnapshot);

  res.json({ goal: updated, snapshot: newSnapshot });
});

// ------------------------------------------
// 4. KNOWLEDGE GRAPH
// ------------------------------------------
apiRouter.get('/graph', (req: Request, res: Response) => {
  const userId = requireAuthUserId(req, res); if (!userId) return;
  const concepts = dbStore.getAllConcepts();
  const twin = dbStore.getTwin(userId);

  // Re-evaluate decay on all skills
  const now = new Date();
  const updatedSkills = { ...twin.skills };
  Object.keys(updatedSkills).forEach((k) => {
    const s = updatedSkills[k];
    const decayInfo = evaluateSkillDecay(s, now);
    updatedSkills[k] = {
      ...s,
      retention: decayInfo.retention,
      reviewDue: decayInfo.reviewDue,
    };
  });
  twin.skills = updatedSkills;
  dbStore.saveTwin(twin);

  const nodes = concepts.map((c) => {
    const skill = twin.skills[c.key] || {
      mastery: 0.15,
      halfLifeDays: 3,
      lastPracticed: '',
      reviewDue: false,
      retention: 0.15,
    };
    const activeMisc = twin.misconceptions.find((m) => m.conceptKey === c.key && m.confidence >= 0.40);

    return {
      id: c.key,
      title: c.title,
      cluster: c.cluster,
      difficulty: c.difficulty,
      summary: c.summary,
      mastery: skill.mastery,
      retention: skill.retention,
      reviewDue: skill.reviewDue,
      activeMisconception: activeMisc ? {
        id: activeMisc.misconceptionId,
        description: activeMisc.description,
        confidence: activeMisc.confidence,
      } : undefined,
    };
  });

  const edges: Array<{ source: string; target: string }> = [];
  concepts.forEach((c) => {
    c.prerequisites.forEach((pKey) => {
      edges.push({
        source: pKey,
        target: c.key,
      });
    });
  });

  res.json({
    nodes,
    edges,
    diagnosedRootCauses: twin.diagnosedRootCauses || [],
  });
});

// ------------------------------------------
// 5. ROOT CAUSE TRACE
// ------------------------------------------
apiRouter.post('/trace', async (req: Request, res: Response) => {
  const userId = requireAuthUserId(req, res); if (!userId) return;
  const { conceptKey } = req.body;
  if (!conceptKey) {
    return res.status(400).json({ error: 'conceptKey is required' });
  }

  const allConcepts = dbStore.getAllConcepts();
  const conceptMap = new Map(allConcepts.map((c) => [c.key, c]));
  const twin = dbStore.getTwin(userId);

  const trace = traceRootCause(conceptKey, conceptMap, twin.skills, twin.misconceptions);
  if (!trace) {
    return res.status(404).json({ error: 'Concept not found' });
  }

  // Get AI explanation if possible
  const failingConcept = conceptMap.get(conceptKey);
  const rootConcept = conceptMap.get(trace.rootConceptKey);
  const aiExplanation = await generateRecommendationExplanation(
    rootConcept?.title || trace.rootConceptKey,
    'root_cause',
    trace.rootMastery,
    failingConcept?.title,
    trace.activeMisconception?.description
  );

  // Update diagnosedRootCauses in twin
  const updatedRootCauses = (twin.diagnosedRootCauses || []).filter(
    (rc) => rc.failingConceptKey !== conceptKey
  );
  updatedRootCauses.push({
    failingConceptKey: conceptKey,
    rootConceptKey: trace.rootConceptKey,
    chain: trace.chain,
    misconceptionId: trace.activeMisconception?.id,
    daysSaved: trace.daysSaved,
  });
  twin.diagnosedRootCauses = updatedRootCauses;
  dbStore.saveTwin(twin);

  res.json({
    ...trace,
    explanation: aiExplanation || trace.explanation,
  });
});

// ------------------------------------------
// 6. DIAGNOSTIC QUIZ
// ------------------------------------------
apiRouter.get('/quiz/next', (req: Request, res: Response) => {
  const userId = requireAuthUserId(req, res); if (!userId) return;
  const twin = dbStore.getTwin(userId);
  const questions = dbStore.getAllQuestions();

  // Find questions targeting weak or decaying skills, or active misconceptions
  const activeMisconceptionKeys = twin.misconceptions
    .filter((m) => m.confidence >= 0.40)
    .map((m) => m.conceptKey);

  const weakKeys = Object.entries(twin.skills)
    .filter(([_, s]) => s.mastery < 0.70 || s.reviewDue)
    .map(([k]) => k);

  // Score candidate questions
  const scored = questions.map((q) => {
    let priority = 10;
    if (activeMisconceptionKeys.includes(q.conceptKey)) priority += 50;
    if (weakKeys.includes(q.conceptKey)) priority += 30;
    return { q, priority };
  });

  scored.sort((a, b) => b.priority - a.priority);
  const selectedQuestions = scored.slice(0, 6).map((s) => s.q);

  res.json({ questions: selectedQuestions });
});

apiRouter.post('/quiz/answer', async (req: Request, res: Response) => {
  const userId = requireAuthUserId(req, res); if (!userId) return;
  const schema = z.object({
    questionId: z.string(),
    selectedOptionId: z.string(),
    reasoningText: z.string().optional(),
  });

  const parse = schema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid answer payload' });
  }

  const { questionId, selectedOptionId, reasoningText = '' } = parse.data;
  const question = dbStore.getQuestion(questionId);
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }

  const option = question.options.find((o) => o.id === selectedOptionId);
  if (!option) {
    return res.status(404).json({ error: 'Option not found' });
  }

  const isCorrect = option.isCorrect;
  const twin = dbStore.getTwin(userId);
  const currentSkill = twin.skills[question.conceptKey] || {
    mastery: 0.20,
    halfLifeDays: 3.0,
    lastPracticed: new Date().toISOString(),
    reviewDue: false,
    retention: 1.0,
  };

  // 1. Update BKT mastery
  const bktResult = updateMasteryBKT(currentSkill.mastery, isCorrect);
  let updatedSkill = {
    ...currentSkill,
    mastery: bktResult.newMastery,
    lastPracticed: new Date().toISOString(),
  };

  // 2. Consolidate memory if correct
  if (isCorrect) {
    updatedSkill = consolidateMemory(updatedSkill, true);
  }

  twin.skills[question.conceptKey] = updatedSkill;

  // 3. Misconception analysis
  let detectedMisconception: any = null;
  const allMisconceptions = dbStore.getAllMisconceptions();

  if (!isCorrect) {
    let targetMisc: any = null;
    if (option.misconceptionId) {
      targetMisc = dbStore.getMisconception(option.misconceptionId);
    }

    // AI classification of reasoning text if provided
    let aiClassification = null;
    if (reasoningText && reasoningText.trim().length > 3) {
      aiClassification = await classifyMisconceptionReasoning(
        question.prompt,
        option.text,
        reasoningText,
        allMisconceptions
      );
    }

    if (!targetMisc && aiClassification?.matchedMisconceptionId) {
      targetMisc = dbStore.getMisconception(aiClassification.matchedMisconceptionId);
    }

    if (targetMisc) {
      const hasAiConfirm = Boolean(aiClassification && aiClassification.confidence > 0.7);
      twin.misconceptions = updateMisconceptionBelief(
        twin.misconceptions,
        targetMisc,
        true,
        hasAiConfirm
      );
      detectedMisconception = {
        id: targetMisc.id,
        title: targetMisc.title,
        description: targetMisc.description,
        fixHint: targetMisc.fixHint,
        confidence: hasAiConfirm ? 0.88 : 0.72,
        extractedBelief: aiClassification?.extractedBelief,
      };
    }
  } else {
    // If correct, weaken related misconceptions
    const relatedMiscs = allMisconceptions.filter((m) => m.conceptKey === question.conceptKey);
    relatedMiscs.forEach((m) => {
      twin.misconceptions = updateMisconceptionBelief(twin.misconceptions, m, false);
    });
  }

  // 4. Update overall readiness score
  const skillValues = Object.values(twin.skills);
  const avgMastery = skillValues.reduce((s, v) => s + v.mastery, 0) / Math.max(1, skillValues.length);
  twin.overallReadiness = Math.round(avgMastery * 100);
  twin.lastUpdated = new Date().toISOString();

  // 5. Automatically trigger adaptive Path recomputation and Diff creation!
  const allConcepts = dbStore.getAllConcepts();
  const resources = dbStore.getAllResources();
  const goal = dbStore.getGoal(userId);
  const newModules = generateAdaptivePath(allConcepts, resources, twin, goal);

  const prevSnapshot = dbStore.getLatestSnapshot(userId);
  const pathDiff = prevSnapshot ? computePathDiff(prevSnapshot.modules, newModules) : undefined;

  const newSnapshot: PathSnapshot = {
    id: `snap_${Date.now()}`,
    userId,
    createdAt: new Date().toISOString(),
    modules: newModules,
    diffFromPrevious: pathDiff,
  };
  dbStore.saveSnapshot(userId, newSnapshot);
  dbStore.saveTwin(twin);

  // Record attempt
  const attempt: Attempt = {
    id: `att_${Date.now()}`,
    userId,
    questionId,
    conceptKey: question.conceptKey,
    selectedOptionId,
    reasoningText,
    detectedMisconceptionId: detectedMisconception?.id,
    correct: isCorrect,
    timestamp: new Date().toISOString(),
    masteryDelta: bktResult.delta,
  };
  dbStore.recordAttempt(attempt);

  res.json({
    isCorrect,
    masteryBefore: currentSkill.mastery,
    masteryAfter: bktResult.newMastery,
    masteryDelta: bktResult.delta,
    explanation: option.explanation,
    detectedMisconception,
    activeMisconceptions: getActiveMisconceptions(twin.misconceptions),
    pathDiff,
    twin,
  });
});

// ------------------------------------------
// 7. TWIN STATE & EXPORT
// ------------------------------------------
apiRouter.get('/twin', (req: Request, res: Response) => {
  const userId = requireAuthUserId(req, res); if (!userId) return;
  const twin = dbStore.getTwin(userId);
  const goal = dbStore.getGoal(userId);

  // Recompute retentions
  const now = new Date();
  Object.keys(twin.skills).forEach((k) => {
    const s = twin.skills[k];
    const decay = evaluateSkillDecay(s, now);
    twin.skills[k] = { ...s, retention: decay.retention, reviewDue: decay.reviewDue };
  });

  res.json({
    twin,
    goal,
    activeMisconceptions: getActiveMisconceptions(twin.misconceptions),
  });
});

apiRouter.delete('/twin', (req: Request, res: Response) => {
  const userId = requireAuthUserId(req, res); if (!userId) return;
  const reset = dbStore.resetTwin(userId);
  res.json({ message: 'Twin state successfully reset to initial baseline', twin: reset });
});

apiRouter.get('/twin/export', (req: Request, res: Response) => {
  const userId = requireAuthUserId(req, res); if (!userId) return;
  const user = dbStore.getUser(userId);
  const safeUser = user ? sanitizeUser(user) : undefined;
  const twin = dbStore.getTwin(userId);
  const goal = dbStore.getGoal(userId);
  const attempts = dbStore.getAttempts(userId);
  const snapshots = dbStore.getSnapshots(userId);

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=learntwin_${safeUser?.name?.toLowerCase().replace(/\s+/g, '_') || 'student'}.json`);
  res.send(JSON.stringify({
    exportedAt: new Date().toISOString(),
    user: safeUser,
    goal,
    twin,
    attempts,
    snapshots,
  }, null, 2));
});

// ------------------------------------------
// 8. PATH SIMULATOR (Monte Carlo)
// ------------------------------------------
apiRouter.post('/simulate', (req: Request, res: Response) => {
  const userId = requireAuthUserId(req, res); if (!userId) return;
  const { hoursPerWeek } = req.body;
  const twin = dbStore.getTwin(userId);
  const goal = dbStore.getGoal(userId);

  const paths = runMonteCarloSimulation(twin, goal, hoursPerWeek);
  res.json({ paths });
});

// ------------------------------------------
// 9. LEARNING PATH & DIFF
// ------------------------------------------
apiRouter.get('/path', (req: Request, res: Response) => {
  const userId = requireAuthUserId(req, res); if (!userId) return;
  let latest = dbStore.getLatestSnapshot(userId);

  if (!latest || latest.modules.length === 0) {
    const allConcepts = dbStore.getAllConcepts();
    const resources = dbStore.getAllResources();
    const twin = dbStore.getTwin(userId);
    const goal = dbStore.getGoal(userId);
    const modules = generateAdaptivePath(allConcepts, resources, twin, goal);

    latest = {
      id: `snap_${Date.now()}`,
      userId,
      createdAt: new Date().toISOString(),
      modules,
    };
    dbStore.saveSnapshot(userId, latest);
  }

  res.json({ snapshot: latest });
});

apiRouter.post('/path/regenerate', (req: Request, res: Response) => {
  const userId = requireAuthUserId(req, res); if (!userId) return;
  const allConcepts = dbStore.getAllConcepts();
  const resources = dbStore.getAllResources();
  const twin = dbStore.getTwin(userId);
  const goal = dbStore.getGoal(userId);

  const prevSnapshot = dbStore.getLatestSnapshot(userId);
  const newModules = generateAdaptivePath(allConcepts, resources, twin, goal);
  const diff = prevSnapshot ? computePathDiff(prevSnapshot.modules, newModules) : undefined;

  const newSnapshot: PathSnapshot = {
    id: `snap_${Date.now()}`,
    userId,
    createdAt: new Date().toISOString(),
    modules: newModules,
    diffFromPrevious: diff,
  };

  dbStore.saveSnapshot(userId, newSnapshot);
  res.json({ snapshot: newSnapshot, diff });
});

apiRouter.get('/diff/history', (req: Request, res: Response) => {
  const userId = requireAuthUserId(req, res); if (!userId) return;
  const snapshots = dbStore.getSnapshots(userId);
  res.json({ snapshots });
});

// ------------------------------------------
// 10. REVIEWS SCHEDULER
// ------------------------------------------
apiRouter.get('/reviews/due', (req: Request, res: Response) => {
  const userId = requireAuthUserId(req, res); if (!userId) return;
  const twin = dbStore.getTwin(userId);
  const allConcepts = dbStore.getAllConcepts();
  const conceptMap = new Map(allConcepts.map((c) => [c.key, c]));

  const now = new Date();
  const dueItems: Array<{
    conceptKey: string;
    title: string;
    cluster: string;
    mastery: number;
    halfLifeDays: number;
    retention: number;
    daysElapsed: number;
  }> = [];

  Object.entries(twin.skills).forEach(([key, skill]) => {
    const decay = evaluateSkillDecay(skill, now);
    if (decay.reviewDue || decay.retention < 0.70) {
      const concept = conceptMap.get(key);
      dueItems.push({
        conceptKey: key,
        title: concept?.title || key,
        cluster: concept?.cluster || 'General',
        mastery: skill.mastery,
        halfLifeDays: skill.halfLifeDays,
        retention: decay.retention,
        daysElapsed: decay.daysElapsed,
      });
    }
  });

  dueItems.sort((a, b) => a.retention - b.retention);
  res.json({ due: dueItems });
});

// ------------------------------------------
// 11. RESOURCES & BANDIT FEEDBACK
// ------------------------------------------
apiRouter.get('/resources/recommend', (req: Request, res: Response) => {
  const userId = requireAuthUserId(req, res); if (!userId) return;
  const conceptKey = req.query.conceptKey as string;
  const twin = dbStore.getTwin(userId);
  const allResources = dbStore.getAllResources();

  const matching = conceptKey
    ? allResources.filter((r) => r.conceptKeys.includes(conceptKey))
    : allResources;

  let totalPulls = 0;
  Object.values(twin.banditStats).forEach((s) => (totalPulls += s.pulls));

  const scored = matching.map((r) => {
    const { score, projectedBoostPercent } = scoreResourceWithBandit(r, twin.banditStats, totalPulls);
    return {
      resource: r,
      banditScore: score,
      projectedBoostPercent,
    };
  });

  scored.sort((a, b) => b.banditScore - a.banditScore);
  res.json({ recommendations: scored });
});

apiRouter.post('/resources/feedback', (req: Request, res: Response) => {
  const userId = requireAuthUserId(req, res); if (!userId) return;
  const schema = z.object({
    resourceId: z.string(),
    format: z.enum(['video', 'article', 'practice', 'worked_example']),
    masteryDelta: z.number().default(0.12),
    rating: z.number().min(1).max(5).default(4),
  });

  const parse = schema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid feedback data' });
  }

  const { format, masteryDelta, rating } = parse.data;
  const twin = dbStore.getTwin(userId);
  twin.banditStats = updateBanditStats(twin.banditStats, format, masteryDelta, rating);
  dbStore.saveTwin(twin);

  res.json({
    message: 'Bandit affinity weights updated',
    updatedBanditStats: twin.banditStats,
  });
});

// ------------------------------------------
// 12. COHORT SIMULATION PROOF
// ------------------------------------------
apiRouter.post('/cohort/run', (req: Request, res: Response) => {
  const userId = requireAuthUserId(req, res);
  if (!userId) return;
  const studentCount = typeof req.body.students === 'number' ? req.body.students : 100;
  const results = runCohortSimulation(studentCount);
  res.json(results);
});

// ------------------------------------------
// 13. EXPLAIN-BACK BONUS
// ------------------------------------------
apiRouter.post('/explain', async (req: Request, res: Response) => {
  const userId = requireAuthUserId(req, res);
  if (!userId) return;
  const { conceptTitle, studentExplanation } = req.body;
  if (!conceptTitle || !studentExplanation) {
    return res.status(400).json({ error: 'conceptTitle and studentExplanation required' });
  }

  const feedback = await evaluateExplainBack(conceptTitle, studentExplanation);
  res.json(feedback);
});

// ------------------------------------------
// 14. STUDENT INTERESTS, FUTURE SCOPE & LEVEL-BASED FIELD PIVOT
// ------------------------------------------
apiRouter.get('/interests/catalog', (_req: Request, res: Response) => {
  res.json({ catalog: INTEREST_CATALOG });
});

apiRouter.get('/interests/profile', (req: Request, res: Response) => {
  const userId = requireAuthUserId(req, res);
  if (!userId) return;
  const profile = dbStore.getInterestProfile(userId);
  res.json({ profile, catalog: INTEREST_CATALOG });
});

apiRouter.put('/interests/profile', (req: Request, res: Response) => {
  const userId = requireAuthUserId(req, res);
  if (!userId) return;

  const schema = z.object({
    interests: z.array(z.string()).max(5),
    customInterest: z.string().trim().max(80).optional(),
  });
  const parse = schema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Please select at least one valid interest.' });
  }

  const { interests, customInterest } = parse.data;
  if (interests.length === 0 && (!customInterest || customInterest.length < 2)) {
    return res.status(400).json({ error: 'Select an interest area or enter your custom interest.' });
  }

  const existing = dbStore.getInterestProfile(userId);
  const futureScopes = getFutureScopesForInterests(interests, customInterest);
  const updated = dbStore.saveInterestProfile({
    ...existing,
    userId,
    interests,
    customInterest: customInterest || undefined,
    futureScopes,
    updatedAt: new Date().toISOString(),
  });

  res.json({ profile: updated });
});

apiRouter.post('/interests/question', async (req: Request, res: Response) => {
  const userId = requireAuthUserId(req, res);
  if (!userId) return;

  const profile = dbStore.getInterestProfile(userId);
  const focusInterestId = typeof req.body?.focusInterestId === 'string' ? req.body.focusInterestId : undefined;
  const requestedDifficulty = req.body?.difficulty as 'foundational' | 'intermediate' | 'advanced' | undefined;
  const preferAi = Boolean(req.body?.preferAi);

  if (profile.interests.length === 0 && !profile.customInterest && !focusInterestId) {
    return res.status(400).json({ error: 'Please select your interests first to unlock tailored questions.' });
  }

  const difficulties: Array<'foundational' | 'intermediate' | 'advanced'> = ['foundational', 'intermediate', 'advanced'];
  const chosenDifficulty = requestedDifficulty || difficulties[Math.floor(Math.random() * difficulties.length)];

  // Try Gemini when user provided a custom interest without preset tracks or explicitly requested AI generation
  let question = null;
  if ((profile.customInterest && profile.interests.length === 0 && !focusInterestId) || preferAi) {
    const label = focusInterestId
      ? getInterestDomain(focusInterestId)?.title || focusInterestId
      : profile.customInterest || getInterestDomain(profile.interests[0])?.title || 'Computing';
    const targetId = focusInterestId || profile.interests[0] || 'ai_ml';
    question = await generateInterestQuestionWithGemini(targetId, label, chosenDifficulty);
  }

  if (!question) {
    question = pickRandomInterestQuestion(
      profile.interests,
      profile.answeredQuestionIds,
      focusInterestId,
      profile.customInterest
    );
  }

  dbStore.cacheInterestQuestion(question);
  res.json({ question });
});

apiRouter.post('/interests/evaluate', async (req: Request, res: Response) => {
  const userId = requireAuthUserId(req, res);
  if (!userId) return;

  const schema = z.object({
    questionId: z.string().min(1),
    selectedOptionId: z.string().min(1),
    reasoningText: z.string().optional(),
  });
  const parse = schema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'questionId and selectedOptionId are required.' });
  }

  const { questionId, selectedOptionId, reasoningText = '' } = parse.data;
  const question =
    INTEREST_QUESTIONS.find((q) => q.id === questionId) || dbStore.getCachedInterestQuestion(questionId);

  if (!question) {
    return res.status(404).json({ error: 'Question not found. Request a fresh random question.' });
  }

  const baseEval = evaluateInterestResponseDeterministic(question, selectedOptionId, reasoningText);
  const refinedPivot = await refineInterestPivotWithGemini(
    question.interestTitle,
    baseEval.responseLevel,
    reasoningText,
    baseEval.suggestedPivot
  );

  const evaluation = {
    ...baseEval,
    suggestedPivot: refinedPivot,
  };

  const profile = dbStore.getInterestProfile(userId);
  const answeredSet = Array.from(new Set([...profile.answeredQuestionIds, question.id])).slice(-40);
  const pivots = [
    evaluation.suggestedPivot,
    ...profile.suggestedPivots.filter((p) => p.suggestedField !== evaluation.suggestedPivot.suggestedField),
  ].slice(0, 6);

  const updatedProfile = dbStore.saveInterestProfile({
    ...profile,
    answeredQuestionIds: answeredSet,
    lastEvaluation: evaluation,
    suggestedPivots: pivots,
    updatedAt: new Date().toISOString(),
  });

  res.json({ evaluation, profile: updatedProfile });
});
