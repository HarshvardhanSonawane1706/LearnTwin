import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { User, TwinState, UserGoal, UserInterestProfile } from "../types";

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
}

interface TwinContextType {
  user: User | null;
  twin: TwinState | null;
  goal: UserGoal | null;
  interestProfile: UserInterestProfile | null;
  dbMode: string;
  isAuthenticated: boolean;
  theme: "light" | "dark";
  toasts: ToastMessage[];
  isLoading: boolean;
  toggleTheme: () => void;
  switchPersona: (persona: "aarav" | "meera" | "rohan") => Promise<User>;
  loginWithEmail: (email: string, password: string) => Promise<{ user: User; interestProfile?: UserInterestProfile }>;
  registerAccount: (name: string, email: string, password: string) => Promise<{ user: User; interestProfile?: UserInterestProfile }>;
  logout: () => void;
  refreshTwin: () => Promise<void>;
  refreshInterestProfile: () => Promise<void>;
  setInterestProfile: (profile: UserInterestProfile) => void;
  notify: (message: string, type?: "success" | "info" | "warning" | "error") => void;
  dismissToast: (id: string) => void;
  setGoal: (goal: UserGoal) => void;
}

const TwinContext = createContext<TwinContextType | undefined>(undefined);

export const TwinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [twin, setTwin] = useState<TwinState | null>(null);
  const [goal, setGoal] = useState<UserGoal | null>(null);
  const [interestProfile, setInterestProfile] = useState<UserInterestProfile | null>(null);
  const [dbMode, setDbMode] = useState<string>("sqlite");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const notify = useCallback((message: string, type: "success" | "info" | "warning" | "error" = "info") => {
    const id = "toast_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      if (next === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  }, []);

  const refreshTwin = useCallback(async () => {
    if (!localStorage.getItem("learntwin_token")) return;
    try {
      const res = await api.getTwin();
      if (res.twin) setTwin(res.twin);
      if (res.goal) setGoal(res.goal);
    } catch (e) {
      console.error("Failed to refresh twin state:", e);
    }
  }, []);

  const refreshInterestProfile = useCallback(async () => {
    if (!localStorage.getItem("learntwin_token")) return;
    try {
      const res = await api.getInterestProfile();
      if (res.profile) setInterestProfile(res.profile);
    } catch (e) {
      console.error("Failed to refresh interest profile:", e);
    }
  }, []);

  const switchPersona = useCallback(async (persona: "aarav" | "meera" | "rohan"): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.switchDemoPersona(persona);
      localStorage.setItem("learntwin_token", res.token);
      setUser(res.user);
      setTwin(res.twin);
      setGoal(res.goal);
      setInterestProfile(res.interestProfile || null);
      notify(
        `Signed in as ${res.user.name} (${
          persona === "aarav" ? "Beginner" : persona === "meera" ? "Intermediate" : "Advanced"
        })`,
        "success"
      );
      return res.user;
    } catch (e: any) {
      notify(e.message || "Failed to switch persona", "error");
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [notify]);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem("learntwin_token", res.token);
    setUser(res.user);
    setTwin(res.twin);
    setGoal(res.goal);
    setInterestProfile(res.interestProfile || null);
    notify(`Welcome back, ${res.user.name}`, "success");
    return { user: res.user, interestProfile: res.interestProfile };
  }, [notify]);

  const registerAccount = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.register(name, email, password);
    localStorage.setItem("learntwin_token", res.token);
    setUser(res.user);
    setTwin(res.twin);
    setGoal(res.goal);
    setInterestProfile(res.interestProfile || null);
    notify(`Account created! Welcome to LearnTwin, ${res.user.name}.`, "success");
    return { user: res.user, interestProfile: res.interestProfile };
  }, [notify]);

  const logout = useCallback(() => {
    localStorage.removeItem("learntwin_token");
    setUser(null);
    setTwin(null);
    setGoal(null);
    setInterestProfile(null);
    notify("Signed out of LearnTwin.", "info");
  }, [notify]);

  // Strict session restoration: never auto-sign-in any user if no valid token exists
  useEffect(() => {
    async function init() {
      try {
        const health = await api.getHealth();
        setDbMode(health.dbMode || "sqlite");

        const existingToken = localStorage.getItem("learntwin_token");
        if (existingToken) {
          try {
            const me = await api.getMe();
            setUser(me.user);
            setTwin(me.twin);
            setGoal(me.goal);
            setInterestProfile(me.interestProfile || null);
          } catch {
            localStorage.removeItem("learntwin_token");
            setUser(null);
            setTwin(null);
            setGoal(null);
            setInterestProfile(null);
          }
        }
      } catch (err) {
        console.warn("Health init check note:", err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  return (
    <TwinContext.Provider
      value={{
        user,
        twin,
        goal,
        interestProfile,
        dbMode,
        isAuthenticated: Boolean(user),
        theme,
        toasts,
        isLoading,
        toggleTheme,
        switchPersona,
        loginWithEmail,
        registerAccount,
        logout,
        refreshTwin,
        refreshInterestProfile,
        setInterestProfile,
        notify,
        dismissToast,
        setGoal,
      }}
    >
      {children}
    </TwinContext.Provider>
  );
};

export const useTwin = () => {
  const context = useContext(TwinContext);
  if (!context) {
    throw new Error("useTwin must be used within a TwinProvider");
  }
  return context;
};
