/**
 * @license
 * Unified Frontend API Service Layer
 * All network calls go through this single file so the data source can be swapped cleanly.
 */

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

const API_BASE = "/api";

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("learntwin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...((options.headers as Record<string, string>) || {}),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errMsg = `HTTP ${res.status} error`;
    try {
      const errJson = await res.json();
      errMsg = errJson.error || errJson.message || errMsg;
    } catch {
      // ignore non-JSON error body
    }
    throw new Error(errMsg);
  }

  return res.json();
}

export const api = {
  // System Health
  getHealth: () =>
    request<{
      status: string;
      dbMode: string;
      sqliteConnected?: boolean;
      supabaseConnected?: boolean;
      counts: any;
    }>("/health"),

  // Authentication & Personas
  login: (email: string, password: string) =>
    request<{ token: string; user: any; twin: any; goal: any; interestProfile?: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    request<{ token: string; user: any; twin: any; goal: any; interestProfile?: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  getMe: () => request<{ user: any; twin: any; goal: any; interestProfile?: any }>("/auth/me"),

  switchDemoPersona: (persona: "aarav" | "meera" | "rohan") =>
    request<{ token: string; user: any; twin: any; goal: any; interestProfile?: any }>(`/auth/demo/${persona}`),

  // Student Interests, Future Scope & Adaptive Field Pivots
  getInterestCatalog: () => request<{ catalog: any[] }>("/interests/catalog"),
  getInterestProfile: () => request<{ profile: any; catalog: any[] }>("/interests/profile"),
  saveInterestProfile: (interests: string[], customInterest?: string) =>
    request<{ profile: any }>("/interests/profile", {
      method: "PUT",
      body: JSON.stringify({ interests, customInterest }),
    }),
  getRandomInterestQuestion: (payload?: {
    focusInterestId?: string;
    difficulty?: "foundational" | "intermediate" | "advanced";
    preferAi?: boolean;
  }) =>
    request<{ question: any }>("/interests/question", {
      method: "POST",
      body: JSON.stringify(payload || {}),
    }),
  evaluateInterestResponse: (payload: {
    questionId: string;
    selectedOptionId: string;
    reasoningText?: string;
  }) =>
    request<{ evaluation: any; profile: any }>("/interests/evaluate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Goals
  getGoal: () => request<any>("/goal"),
  updateGoal: (goal: any) =>
    request<{ goal: any; snapshot: any }>("/goal", {
      method: "PUT",
      body: JSON.stringify(goal),
    }),

  // Knowledge Graph & Root Cause
  getGraph: () =>
    request<{
      nodes: Array<{
        id: string;
        title: string;
        cluster: string;
        difficulty: string;
        summary: string;
        mastery: number;
        retention: number;
        reviewDue: boolean;
        activeMisconception?: { id: string; description: string; confidence: number };
      }>;
      edges: Array<{ source: string; target: string }>;
      diagnosedRootCauses: any[];
    }>("/graph"),

  traceRootCause: (conceptKey: string) =>
    request<any>("/trace", {
      method: "POST",
      body: JSON.stringify({ conceptKey }),
    }),

  // Diagnostic Quiz
  getQuizQuestions: () => request<{ questions: any[] }>("/quiz/next"),
  submitQuizAnswer: (payload: { questionId: string; selectedOptionId: string; reasoningText?: string }) =>
    request<any>("/quiz/answer", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Digital Twin
  getTwin: () => request<{ twin: any; goal: any; activeMisconceptions: any[] }>("/twin"),
  resetTwin: () => request<any>("/twin", { method: "DELETE" }),
  getExportUrl: () => `${API_BASE}/twin/export`,

  // Path & Diff
  getPath: () => request<{ snapshot: any }>("/path"),
  regeneratePath: () => request<{ snapshot: any; diff?: any }>("/path/regenerate", { method: "POST" }),
  getDiffHistory: () => request<{ snapshots: any[] }>("/diff/history"),

  // Path Simulator (Monte Carlo)
  simulatePaths: (hoursPerWeek?: number) =>
    request<{ paths: any[] }>("/simulate", {
      method: "POST",
      body: JSON.stringify({ hoursPerWeek }),
    }),

  // Reviews
  getDueReviews: () => request<{ due: any[] }>("/reviews/due"),

  // Resources & Bandit
  recommendResources: (conceptKey?: string) =>
    request<{ recommendations: any[] }>(`/resources/recommend${conceptKey ? `?conceptKey=${conceptKey}` : ""}`),
  submitResourceFeedback: (payload: { resourceId: string; format: string; masteryDelta: number; rating: number }) =>
    request<any>("/resources/feedback", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Cohort Simulation Proof
  runCohortSimulation: (students: number = 100) =>
    request<any>("/cohort/run", {
      method: "POST",
      body: JSON.stringify({ students }),
    }),

  // Explain-Back bonus
  evaluateExplainBack: (conceptTitle: string, studentExplanation: string) =>
    request<any>("/explain", {
      method: "POST",
      body: JSON.stringify({ conceptTitle, studentExplanation }),
    }),
};
