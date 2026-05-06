import type { ViralAnalysis } from "./gemini";

// ── Types ─────────────────────────────────────────────────────────────────────

export type HistoryEntry = {
  id: string;
  timestamp: number;
  platform: string;
  contentType: string;
  contentPreview: string;
  result: ViralAnalysis;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const HISTORY_KEY = "viralscore_history";
const MAX_ENTRIES = 10;

// ── Functions ─────────────────────────────────────────────────────────────────

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse history:", error);
    return [];
  }
}

export function saveToHistory(
  entry: Omit<HistoryEntry, "id" | "timestamp">
): HistoryEntry {
  const newEntry: HistoryEntry = {
    ...entry,
    id: Date.now().toString(36) + Math.random().toString(36).substring(2),
    timestamp: Date.now(),
  };

  try {
    const current = getHistory();
    const updated = [newEntry, ...current].slice(0, MAX_ENTRIES);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return newEntry;
  } catch (error) {
    console.error("Failed to save history:", error);
    return newEntry; // Still return it even if it failed to save
  }
}

export function deleteFromHistory(id: string): void {
  try {
    const current = getHistory();
    const updated = current.filter((entry) => entry.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to delete from history:", error);
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear history:", error);
  }
}

export function getScoreTrend(
  history: HistoryEntry[]
): "up" | "down" | "stable" | "insufficient" {
  if (history.length < 2) return "insufficient";

  // Last 3 entries (or 2 if only 2 exist)
  const recent = history.slice(0, 3);
  
  // Compare newest [0] vs older [1]
  const latestScore = recent[0].result.overallScore;
  const previousScore = recent[1].result.overallScore;

  if (latestScore > previousScore) return "up";
  if (latestScore < previousScore) return "down";
  return "stable";
}
