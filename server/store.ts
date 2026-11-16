/**
 * @license
 * Persistent SQLite + Optional Supabase Sync Database Store
 *
 * Uses Node.js built-in SQLite (data/learntwin.db) as the persistent relational
 * database for users (with bcrypt password hashes), goals, twin states, attempts,
 * and path snapshots, with non-blocking Supabase table sync when reachable.
 */

import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import { supabaseServer, SUPABASE_PROJECT_URL } from './supabase.js';
import {
  Concept,
  Question,
  Misconception,
  Resource,
  User,
  UserGoal,
  TwinState,
  Attempt,
  PathSnapshot,
  InterestQuestion,
  UserInterestProfile,
} from './types.js';
import {
  INITIAL_CONCEPTS,
  INITIAL_MISCONCEPTIONS,
  INITIAL_QUESTIONS,
  INITIAL_RESOURCES,
  DEMO_PERSONAS,
} from './seedData.js';
import { generateAdaptivePath } from './engine/pathGenerator.js';

export type DBMode = 'sqlite+supabase' | 'sqlite' | 'in-memory';

const DEFAULT_DEMO_PASSWORD_HASH = bcrypt.hashSync('demo1234', 8);

class Store {
  private dbMode: DBMode = 'sqlite';
  private initialized = false;
  private sqliteConnected = false;
  private supabaseConnected = false;
  private db: DatabaseSync | null = null;

  public concepts: Map<string, Concept> = new Map();
  public misconceptions: Map<string, Misconception> = new Map();
  public questions: Map<string, Question> = new Map();
  public resources: Map<string, Resource> = new Map();
  public users: Map<string, User> = new Map();
  public goals: Map<string, UserGoal> = new Map();
  public twins: Map<string, TwinState> = new Map();
  public attempts: Attempt[] = [];
  public snapshots: Map<string, PathSnapshot[]> = new Map();
  public interestProfiles: Map<string, UserInterestProfile> = new Map();
  public dynamicInterestQuestions: Map<string, InterestQuestion> = new Map();

  constructor() {
    this.seedCatalogs();
  }

  private seedCatalogs() {
    INITIAL_CONCEPTS.forEach((c) => this.concepts.set(c.key, c));
    INITIAL_MISCONCEPTIONS.forEach((m) => this.misconceptions.set(m.id, m));
    INITIAL_QUESTIONS.forEach((q) => this.questions.set(q.id, q));
    INITIAL_RESOURCES.forEach((r) => this.resources.set(r.id, r));
  }

  public async init() {
    if (this.initialized) return;
    this.initialized = true;

    try {
      const dataDir = path.resolve(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const dbPath = path.join(dataDir, 'learntwin.db');
      this.db = new DatabaseSync(dbPath);
      this.db.exec('PRAGMA journal_mode = WAL;');
      this.db.exec('PRAGMA foreign_keys = ON;');
      this.createTables();
      this.seedDemoPersonasIntoSqlite();
      this.loadFromSqlite();
      this.sqliteConnected = true;
      this.dbMode = 'sqlite';
      console.log(`SQLite database ready at ${dbPath} (${this.users.size} users loaded).`);
    } catch (err) {
      console.error('SQLite initialization error, falling back to in-memory seed:', (err as Error).message);
      this.seedInMemoryFallback();
      this.sqliteConnected = false;
      this.dbMode = 'in-memory';
    }

    // Probe Supabase reachability (non-blocking if offline/sandboxed)
    try {
      const { error } = await supabaseServer.from('users').select('id').limit(1);
      if (!error) {
        this.supabaseConnected = true;
        if (this.sqliteConnected) {
          this.dbMode = 'sqlite+supabase';
        }
        console.log(`Supabase reachable at ${SUPABASE_PROJECT_URL}; sync active.`);
      } else {
        // PostgREST error (e.g. table missing) still means host was reachable vs network failure
        const msg = error.message || '';
        const networkFail = msg.toLowerCase().includes('fetch failed') || msg.toLowerCase().includes('enotfound');
        this.supabaseConnected = !networkFail;
        if (this.supabaseConnected && this.sqliteConnected) {
          this.dbMode = 'sqlite+supabase';
        }
        console.log(`Supabase probe note: ${msg}`);
      }
    } catch (err) {
      this.supabaseConnected = false;
      console.log(`Supabase offline/unreachable (${(err as Error).message}); running on local SQLite database.`);
    }
  }

  private createTables() {
    if (!this.db) return;
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT,
        role TEXT NOT NULL DEFAULT 'student',
        persona_id TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS goals (
        user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        domain TEXT NOT NULL,
        target_profile TEXT NOT NULL,
        deadline_weeks INTEGER NOT NULL,
        hours_per_week INTEGER NOT NULL,
        target_concepts TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS twins (
        user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        skills TEXT NOT NULL,
        misconceptions TEXT NOT NULL,
        bandit_stats TEXT NOT NULL,
        overall_readiness INTEGER NOT NULL,
        streak_days INTEGER NOT NULL,
        diagnosed_root_causes TEXT NOT NULL,
        last_updated TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS attempts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        question_id TEXT NOT NULL,
        concept_key TEXT NOT NULL,
        selected_option_id TEXT NOT NULL,
        correct INTEGER NOT NULL,
        reasoning_text TEXT,
        detected_misconception_id TEXT,
        mastery_delta REAL NOT NULL,
        timestamp TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS path_snapshots (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        modules TEXT NOT NULL,
        diff_from_previous TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS interest_profiles (
        user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        interests TEXT NOT NULL,
        custom_interest TEXT,
        future_scopes TEXT NOT NULL,
        answered_question_ids TEXT NOT NULL,
        last_evaluation TEXT,
        suggested_pivots TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  }

  private seedDemoPersonasIntoSqlite() {
    if (!this.db) return;

    const insertUser = this.db.prepare(`
      INSERT OR IGNORE INTO users (id, name, email, password_hash, role, persona_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const ensureDemoHash = this.db.prepare(`
      UPDATE users SET password_hash = ? WHERE id = ? AND (password_hash IS NULL OR password_hash = '')
    `);
    const insertGoal = this.db.prepare(`
      INSERT OR IGNORE INTO goals (user_id, domain, target_profile, deadline_weeks, hours_per_week, target_concepts)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const insertTwin = this.db.prepare(`
      INSERT OR IGNORE INTO twins (user_id, skills, misconceptions, bandit_stats, overall_readiness, streak_days, diagnosed_root_causes, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const countSnapshots = this.db.prepare(`SELECT COUNT(*) as cnt FROM path_snapshots WHERE user_id = ?`);
    const insertSnapshot = this.db.prepare(`
      INSERT OR IGNORE INTO path_snapshots (id, user_id, modules, diff_from_previous, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    const conceptsList = Array.from(this.concepts.values());
    const resourcesList = Array.from(this.resources.values());

    DEMO_PERSONAS.forEach((p) => {
      insertUser.run(
        p.user.id,
        p.user.name,
        p.user.email.toLowerCase(),
        DEFAULT_DEMO_PASSWORD_HASH,
        p.user.role,
        p.user.personaId || null,
        p.user.createdAt
      );
      ensureDemoHash.run(DEFAULT_DEMO_PASSWORD_HASH, p.user.id);

      insertGoal.run(
        p.goal.userId,
        p.goal.domain,
        p.goal.targetProfile,
        p.goal.deadlineWeeks,
        p.goal.hoursPerWeek,
        JSON.stringify(p.goal.targetConcepts)
      );

      insertTwin.run(
        p.twin.userId,
        JSON.stringify(p.twin.skills),
        JSON.stringify(p.twin.misconceptions),
        JSON.stringify(p.twin.banditStats),
        p.twin.overallReadiness,
        p.twin.streakDays,
        JSON.stringify(p.twin.diagnosedRootCauses || []),
        p.twin.lastUpdated
      );

      const snapCountRow = countSnapshots.get(p.user.id) as { cnt: number } | undefined;
      if (!snapCountRow || snapCountRow.cnt === 0) {
        const modules = generateAdaptivePath(conceptsList, resourcesList, p.twin, p.goal);
        insertSnapshot.run(
          p.pathSnapshot.id,
          p.user.id,
          JSON.stringify(modules),
          p.pathSnapshot.diffFromPrevious ? JSON.stringify(p.pathSnapshot.diffFromPrevious) : null,
          p.pathSnapshot.createdAt
        );
      }
    });
  }

  private loadFromSqlite() {
    if (!this.db) return;

    this.users.clear();
    this.goals.clear();
    this.twins.clear();
    this.attempts = [];
    this.snapshots.clear();

    const userRows = this.db.prepare('SELECT * FROM users').all() as any[];
    userRows.forEach((row) => {
      this.users.set(row.id, {
        id: row.id,
        name: row.name,
        email: row.email,
        passwordHash: row.password_hash || undefined,
        role: row.role || 'student',
        personaId: row.persona_id || undefined,
        createdAt: row.created_at,
      });
    });

    const goalRows = this.db.prepare('SELECT * FROM goals').all() as any[];
    goalRows.forEach((row) => {
      this.goals.set(row.user_id, {
        userId: row.user_id,
        domain: row.domain,
        targetProfile: row.target_profile,
        deadlineWeeks: row.deadline_weeks,
        hoursPerWeek: row.hours_per_week,
        targetConcepts: JSON.parse(row.target_concepts || '[]'),
      });
    });

    const twinRows = this.db.prepare('SELECT * FROM twins').all() as any[];
    twinRows.forEach((row) => {
      this.twins.set(row.user_id, {
        userId: row.user_id,
        skills: JSON.parse(row.skills || '{}'),
        misconceptions: JSON.parse(row.misconceptions || '[]'),
        banditStats: JSON.parse(row.bandit_stats || '{}'),
        overallReadiness: row.overall_readiness,
        streakDays: row.streak_days,
        diagnosedRootCauses: JSON.parse(row.diagnosed_root_causes || '[]'),
        lastUpdated: row.last_updated,
      });
    });

    const attemptRows = this.db.prepare('SELECT * FROM attempts ORDER BY timestamp ASC').all() as any[];
    attemptRows.forEach((row) => {
      this.attempts.push({
        id: row.id,
        userId: row.user_id,
        questionId: row.question_id,
        conceptKey: row.concept_key,
        selectedOptionId: row.selected_option_id,
        correct: Boolean(row.correct),
        reasoningText: row.reasoning_text || undefined,
        detectedMisconceptionId: row.detected_misconception_id || undefined,
        masteryDelta: row.mastery_delta,
        timestamp: row.timestamp,
      });
    });

    const snapshotRows = this.db.prepare('SELECT * FROM path_snapshots ORDER BY created_at ASC').all() as any[];
    snapshotRows.forEach((row) => {
      const list = this.snapshots.get(row.user_id) || [];
      list.push({
        id: row.id,
        userId: row.user_id,
        createdAt: row.created_at,
        modules: JSON.parse(row.modules || '[]'),
        diffFromPrevious: row.diff_from_previous ? JSON.parse(row.diff_from_previous) : undefined,
      });
      this.snapshots.set(row.user_id, list);
    });

    this.interestProfiles.clear();
    const interestRows = this.db.prepare('SELECT * FROM interest_profiles').all() as any[];
    interestRows.forEach((row) => {
      this.interestProfiles.set(row.user_id, {
        userId: row.user_id,
        interests: JSON.parse(row.interests || '[]'),
        customInterest: row.custom_interest || undefined,
        futureScopes: JSON.parse(row.future_scopes || '[]'),
        answeredQuestionIds: JSON.parse(row.answered_question_ids || '[]'),
        lastEvaluation: row.last_evaluation ? JSON.parse(row.last_evaluation) : undefined,
        suggestedPivots: JSON.parse(row.suggested_pivots || '[]'),
        updatedAt: row.updated_at,
      });
    });
  }

  private seedInMemoryFallback() {
    DEMO_PERSONAS.forEach((p) => {
      this.users.set(p.user.id, { ...p.user, passwordHash: DEFAULT_DEMO_PASSWORD_HASH });
      this.goals.set(p.user.id, p.goal);
      this.twins.set(p.user.id, p.twin);

      const modules = generateAdaptivePath(
        Array.from(this.concepts.values()),
        Array.from(this.resources.values()),
        p.twin,
        p.goal
      );
      this.snapshots.set(p.user.id, [{ ...p.pathSnapshot, modules }]);
    });
  }

  public getDbMode(): DBMode {
    return this.dbMode;
  }

  public getHealth() {
    return {
      status: 'ok',
      dbMode: this.dbMode,
      sqliteConnected: this.sqliteConnected,
      supabaseUrl: SUPABASE_PROJECT_URL,
      supabaseConnected: this.supabaseConnected,
      timestamp: new Date().toISOString(),
      counts: {
        concepts: this.concepts.size,
        questions: this.questions.size,
        misconceptions: this.misconceptions.size,
        resources: this.resources.size,
        users: this.users.size,
      },
    };
  }

  public getAllConcepts(): Concept[] {
    return Array.from(this.concepts.values());
  }

  public getConcept(key: string): Concept | undefined {
    return this.concepts.get(key);
  }

  public getAllQuestions(): Question[] {
    return Array.from(this.questions.values());
  }

  public getQuestion(id: string): Question | undefined {
    return this.questions.get(id);
  }

  public getAllMisconceptions(): Misconception[] {
    return Array.from(this.misconceptions.values());
  }

  public getMisconception(id: string): Misconception | undefined {
    return this.misconceptions.get(id);
  }

  public getAllResources(): Resource[] {
    return Array.from(this.resources.values());
  }

  public getResource(id: string): Resource | undefined {
    return this.resources.get(id);
  }

  // Users & Goals
  public getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  public findUserByEmail(email: string): User | undefined {
    const normalized = email.trim().toLowerCase();
    return Array.from(this.users.values()).find((u) => u.email.toLowerCase() === normalized);
  }

  public saveUser(user: User): User {
    const normalizedUser: User = {
      ...user,
      email: user.email.trim().toLowerCase(),
    };
    this.users.set(normalizedUser.id, normalizedUser);

    if (this.db) {
      this.db
        .prepare(`
          INSERT INTO users (id, name, email, password_hash, role, persona_id, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            email = excluded.email,
            password_hash = COALESCE(excluded.password_hash, users.password_hash),
            role = excluded.role,
            persona_id = excluded.persona_id
        `)
        .run(
          normalizedUser.id,
          normalizedUser.name,
          normalizedUser.email,
          normalizedUser.passwordHash || null,
          normalizedUser.role,
          normalizedUser.personaId || null,
          normalizedUser.createdAt
        );
    }

    if (this.supabaseConnected) {
      Promise.resolve(
        supabaseServer.from('users').upsert({
          id: normalizedUser.id,
          name: normalizedUser.name,
          email: normalizedUser.email,
          password_hash: normalizedUser.passwordHash || null,
          role: normalizedUser.role,
          persona_id: normalizedUser.personaId || null,
          created_at: normalizedUser.createdAt,
        })
      ).catch(() => {});
    }

    return normalizedUser;
  }

  public getGoal(userId: string): UserGoal {
    const existing = this.goals.get(userId);
    if (existing) return existing;

    const defaultGoal: UserGoal = {
      userId,
      domain: 'Python & Data Structures',
      targetProfile: 'Crack Coding Interviews',
      deadlineWeeks: 8,
      hoursPerWeek: 4,
      targetConcepts: [
        'recursion_anatomy',
        'call_stack_frames',
        'dp_memoization_topdown',
        'graph_traversal_bfs_dfs',
      ],
    };
    return this.updateGoal(userId, defaultGoal);
  }

  public updateGoal(userId: string, partial: Partial<UserGoal>): UserGoal {
    const base: UserGoal = this.goals.get(userId) || {
      userId,
      domain: 'Python & Data Structures',
      targetProfile: 'Crack Coding Interviews',
      deadlineWeeks: 8,
      hoursPerWeek: 4,
      targetConcepts: [
        'recursion_anatomy',
        'call_stack_frames',
        'dp_memoization_topdown',
        'graph_traversal_bfs_dfs',
      ],
    };
    const updated: UserGoal = { ...base, ...partial, userId };
    this.goals.set(userId, updated);

    if (this.db) {
      this.db
        .prepare(`
          INSERT INTO goals (user_id, domain, target_profile, deadline_weeks, hours_per_week, target_concepts)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            domain = excluded.domain,
            target_profile = excluded.target_profile,
            deadline_weeks = excluded.deadline_weeks,
            hours_per_week = excluded.hours_per_week,
            target_concepts = excluded.target_concepts
        `)
        .run(
          userId,
          updated.domain,
          updated.targetProfile,
          updated.deadlineWeeks,
          updated.hoursPerWeek,
          JSON.stringify(updated.targetConcepts)
        );
    }

    if (this.supabaseConnected) {
      Promise.resolve(
        supabaseServer.from('goals').upsert({
          user_id: userId,
          domain: updated.domain,
          target_profile: updated.targetProfile,
          deadline_weeks: updated.deadlineWeeks,
          hours_per_week: updated.hoursPerWeek,
          target_concepts: updated.targetConcepts,
        })
      ).catch(() => {});
    }

    return updated;
  }

  // Twin State
  public getTwin(userId: string): TwinState {
    const existing = this.twins.get(userId);
    if (existing) return existing;

    const freshTwin: TwinState = {
      userId,
      skills: {
        variables_and_references: {
          mastery: 0.50,
          halfLifeDays: 3.5,
          lastPracticed: new Date().toISOString(),
          reviewDue: false,
          retention: 1.0,
        },
        call_stack_frames: {
          mastery: 0.30,
          halfLifeDays: 3.0,
          lastPracticed: new Date().toISOString(),
          reviewDue: false,
          retention: 1.0,
        },
      },
      misconceptions: [],
      banditStats: {
        video: { pulls: 2, reward: 0.2 },
        article: { pulls: 2, reward: 0.2 },
        practice: { pulls: 2, reward: 0.2 },
        worked_example: { pulls: 2, reward: 0.2 },
      },
      lastUpdated: new Date().toISOString(),
      overallReadiness: 35,
      streakDays: 1,
      diagnosedRootCauses: [],
    };
    return this.saveTwin(freshTwin);
  }

  public saveTwin(twin: TwinState): TwinState {
    this.twins.set(twin.userId, twin);

    if (this.db) {
      this.db
        .prepare(`
          INSERT INTO twins (user_id, skills, misconceptions, bandit_stats, overall_readiness, streak_days, diagnosed_root_causes, last_updated)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            skills = excluded.skills,
            misconceptions = excluded.misconceptions,
            bandit_stats = excluded.bandit_stats,
            overall_readiness = excluded.overall_readiness,
            streak_days = excluded.streak_days,
            diagnosed_root_causes = excluded.diagnosed_root_causes,
            last_updated = excluded.last_updated
        `)
        .run(
          twin.userId,
          JSON.stringify(twin.skills),
          JSON.stringify(twin.misconceptions),
          JSON.stringify(twin.banditStats),
          twin.overallReadiness,
          twin.streakDays,
          JSON.stringify(twin.diagnosedRootCauses || []),
          twin.lastUpdated
        );
    }

    if (this.supabaseConnected) {
      Promise.resolve(
        supabaseServer.from('twins').upsert({
          user_id: twin.userId,
          skills: twin.skills,
          misconceptions: twin.misconceptions,
          bandit_stats: twin.banditStats,
          overall_readiness: twin.overallReadiness,
          streak_days: twin.streakDays,
          diagnosed_root_causes: twin.diagnosedRootCauses || [],
          last_updated: twin.lastUpdated,
        })
      ).catch(() => {});
    }

    return twin;
  }

  public resetTwin(userId: string): TwinState {
    const persona = DEMO_PERSONAS.find((p) => p.user.id === userId);
    if (persona) {
      const twinCopy = JSON.parse(JSON.stringify(persona.twin)) as TwinState;
      const goalCopy = JSON.parse(JSON.stringify(persona.goal)) as UserGoal;
      this.updateGoal(userId, goalCopy);
      return this.saveTwin(twinCopy);
    }
    this.twins.delete(userId);
    if (this.db) {
      this.db.prepare('DELETE FROM twins WHERE user_id = ?').run(userId);
    }
    return this.getTwin(userId);
  }

  // Attempts
  public recordAttempt(attempt: Attempt): void {
    this.attempts.push(attempt);

    if (this.db) {
      this.db
        .prepare(`
          INSERT OR REPLACE INTO attempts (id, user_id, question_id, concept_key, selected_option_id, correct, reasoning_text, detected_misconception_id, mastery_delta, timestamp)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          attempt.id,
          attempt.userId,
          attempt.questionId,
          attempt.conceptKey,
          attempt.selectedOptionId,
          attempt.correct ? 1 : 0,
          attempt.reasoningText || null,
          attempt.detectedMisconceptionId || null,
          attempt.masteryDelta,
          attempt.timestamp
        );
    }

    if (this.supabaseConnected) {
      Promise.resolve(
        supabaseServer.from('attempts').insert({
          id: attempt.id,
          user_id: attempt.userId,
          question_id: attempt.questionId,
          concept_key: attempt.conceptKey,
          selected_option_id: attempt.selectedOptionId,
          correct: attempt.correct,
          reasoning_text: attempt.reasoningText,
          detected_misconception_id: attempt.detectedMisconceptionId,
          mastery_delta: attempt.masteryDelta,
          timestamp: attempt.timestamp,
        })
      ).catch(() => {});
    }
  }

  public getAttempts(userId: string): Attempt[] {
    return this.attempts.filter((a) => a.userId === userId);
  }

  // Snapshots & Diffs
  public getSnapshots(userId: string): PathSnapshot[] {
    return this.snapshots.get(userId) || [];
  }

  public getLatestSnapshot(userId: string): PathSnapshot | undefined {
    const list = this.snapshots.get(userId);
    return list && list.length > 0 ? list[list.length - 1] : undefined;
  }

  public saveSnapshot(userId: string, snapshot: PathSnapshot): void {
    const list = this.snapshots.get(userId) || [];
    list.push(snapshot);
    this.snapshots.set(userId, list);

    if (this.db) {
      this.db
        .prepare(`
          INSERT OR REPLACE INTO path_snapshots (id, user_id, modules, diff_from_previous, created_at)
          VALUES (?, ?, ?, ?, ?)
        `)
        .run(
          snapshot.id,
          userId,
          JSON.stringify(snapshot.modules),
          snapshot.diffFromPrevious ? JSON.stringify(snapshot.diffFromPrevious) : null,
          snapshot.createdAt
        );
    }

    if (this.supabaseConnected) {
      Promise.resolve(
        supabaseServer.from('path_snapshots').insert({
          id: snapshot.id,
          user_id: userId,
          modules: snapshot.modules,
          diff_from_previous: snapshot.diffFromPrevious,
          created_at: snapshot.createdAt,
        })
      ).catch(() => {});
    }
  }

  // Student Interest Profiles & Dynamic Interest Questions
  public getInterestProfile(userId: string): UserInterestProfile {
    const existing = this.interestProfiles.get(userId);
    if (existing) return existing;
    return {
      userId,
      interests: [],
      futureScopes: [],
      answeredQuestionIds: [],
      suggestedPivots: [],
      updatedAt: new Date().toISOString(),
    };
  }

  public saveInterestProfile(profile: UserInterestProfile): UserInterestProfile {
    this.interestProfiles.set(profile.userId, profile);

    if (this.db) {
      this.db
        .prepare(`
          INSERT INTO interest_profiles (user_id, interests, custom_interest, future_scopes, answered_question_ids, last_evaluation, suggested_pivots, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            interests = excluded.interests,
            custom_interest = excluded.custom_interest,
            future_scopes = excluded.future_scopes,
            answered_question_ids = excluded.answered_question_ids,
            last_evaluation = excluded.last_evaluation,
            suggested_pivots = excluded.suggested_pivots,
            updated_at = excluded.updated_at
        `)
        .run(
          profile.userId,
          JSON.stringify(profile.interests),
          profile.customInterest || null,
          JSON.stringify(profile.futureScopes),
          JSON.stringify(profile.answeredQuestionIds),
          profile.lastEvaluation ? JSON.stringify(profile.lastEvaluation) : null,
          JSON.stringify(profile.suggestedPivots),
          profile.updatedAt
        );
    }

    if (this.supabaseConnected) {
      Promise.resolve(
        supabaseServer.from('interest_profiles').upsert({
          user_id: profile.userId,
          interests: profile.interests,
          custom_interest: profile.customInterest || null,
          future_scopes: profile.futureScopes,
          answered_question_ids: profile.answeredQuestionIds,
          last_evaluation: profile.lastEvaluation || null,
          suggested_pivots: profile.suggestedPivots,
          updated_at: profile.updatedAt,
        })
      ).catch(() => {});
    }

    return profile;
  }

  public cacheInterestQuestion(question: InterestQuestion): void {
    this.dynamicInterestQuestions.set(question.id, question);
  }

  public getCachedInterestQuestion(id: string): InterestQuestion | undefined {
    return this.dynamicInterestQuestions.get(id);
  }
}

export const dbStore = new Store();
