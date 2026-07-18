import { appStorage } from '@/utils/app-storage';

const STORAGE_KEY = 'buildev-recent-files';
/** Cap for persisted list (Recents page shows all stored entries, deduped + sorted). */
const MAX_STORED_RECENT_FILES = 500;
/** Compact menus (File menu, etc.) only show a short list. */
const MAX_MENU_RECENT_FILES = 15;

export interface RecentFile {
  fileName: string;
  filePath: string | null;
  lastOpened: number;
}

export function getRecentFiles(): RecentFile[] {
  try {
    const raw = appStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Stable id for dedupe / workspace assignment (matches dashboard `path:` / `name:` keys). */
export function recentFileStableId(r: RecentFile): string {
  if (r.filePath) return `path:${r.filePath.replace(/\\/g, '/')}`;
  return `name:${r.fileName}`;
}

/** Dedupes by path/name, sorts newest `lastOpened` first (typical Recents order). */
export function getUniqueRecentsSortedByLastOpenedDesc(): RecentFile[] {
  const raw = getRecentFiles();
  const byId = new Map<string, RecentFile>();
  for (const r of raw) {
    const id = recentFileStableId(r);
    const prev = byId.get(id);
    if (!prev || r.lastOpened > prev.lastOpened) byId.set(id, r);
  }
  return [...byId.values()].sort((a, b) => b.lastOpened - a.lastOpened);
}

export function getRecentFilesForMenu(): RecentFile[] {
  return getUniqueRecentsSortedByLastOpenedDesc().slice(0, MAX_MENU_RECENT_FILES);
}

function syncToElectron(files: RecentFile[]): void {
  if (typeof window !== 'undefined' && window.electronAPI?.syncRecentFiles) {
    const forMenu = [...files]
      .filter((f) => f.filePath)
      .sort((a, b) => b.lastOpened - a.lastOpened)
      .slice(0, 30)
      .map((f) => ({ fileName: f.fileName, filePath: f.filePath! }));
    window.electronAPI.syncRecentFiles(forMenu);
  }
}

export function addRecentFile(entry: Omit<RecentFile, 'lastOpened'>): void {
  const files = getRecentFiles();
  const filtered = files.filter(
    (f) => !(f.fileName === entry.fileName && f.filePath === entry.filePath),
  );
  const newEntry: RecentFile = { ...entry, lastOpened: Date.now() };
  const updated = [newEntry, ...filtered].slice(0, MAX_STORED_RECENT_FILES);
  appStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  syncToElectron(updated);
}

export function clearRecentFiles(): void {
  appStorage.removeItem(STORAGE_KEY);
  syncToElectron([]);
}

/**
 * Format a timestamp as a relative time string.
 * Returns an i18n key + interpolation params.
 */
export function relativeTime(timestamp: number): { key: string; params?: Record<string, number> } {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return { key: 'fileMenu.justNow' };
  if (minutes < 60) return { key: 'fileMenu.minutesAgo', params: { count: minutes } };
  if (hours < 24) return { key: 'fileMenu.hoursAgo', params: { count: hours } };
  if (days < 2) return { key: 'fileMenu.yesterday' };
  return { key: 'fileMenu.daysAgo', params: { count: days } };
}
