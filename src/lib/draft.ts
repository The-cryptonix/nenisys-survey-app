import type { Answers } from './answers';

/**
 * Progress is kept in this browser only (localStorage), never on a server.
 * Everything is wrapped in try/catch because storage can be blocked or full.
 */

const PREFIX = 'nenisys-survey:v1:';
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface Draft {
  answers: Answers;
  currentId: string | null;
  consent: boolean;
  savedAt: number;
}

const draftKey = (versionId: string) => `${PREFIX}draft:${versionId}`;
const doneKey = (versionId: string) => `${PREFIX}done:${versionId}`;

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function parseAnswers(v: unknown): Answers | null {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return null;
  const out: Answers = {};
  for (const [id, raw] of Object.entries(v)) {
    if (typeof raw !== 'object' || raw === null) return null;
    const { optionIds, otherText } = raw as { optionIds?: unknown; otherText?: unknown };
    if (!Array.isArray(optionIds) || !optionIds.every((x): x is string => typeof x === 'string')) return null;
    if (typeof otherText !== 'string') return null;
    out[id] = { optionIds, otherText };
  }
  return out;
}

export function loadDraft(versionId: string): Draft | null {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(draftKey(versionId));
    if (!raw) return null;
    const d = JSON.parse(raw) as Record<string, unknown>;
    const answers = parseAnswers(d.answers);
    if (!answers || typeof d.savedAt !== 'number' || Date.now() - d.savedAt > DRAFT_TTL_MS) {
      s.removeItem(draftKey(versionId));
      return null;
    }
    return {
      answers,
      currentId: typeof d.currentId === 'string' ? d.currentId : null,
      consent: d.consent === true,
      savedAt: d.savedAt,
    };
  } catch {
    return null;
  }
}

export function saveDraft(versionId: string, draft: Omit<Draft, 'savedAt'>): void {
  try {
    storage()?.setItem(draftKey(versionId), JSON.stringify({ ...draft, savedAt: Date.now() }));
  } catch {
    /* storage unavailable: the survey still works, progress just is not kept */
  }
}

export function clearDraft(versionId: string): void {
  try {
    storage()?.removeItem(draftKey(versionId));
  } catch {
    /* ignore */
  }
}

export function isSubmitted(versionId: string): boolean {
  try {
    return storage()?.getItem(doneKey(versionId)) === '1';
  } catch {
    return false;
  }
}

export function markSubmitted(versionId: string): void {
  try {
    storage()?.setItem(doneKey(versionId), '1');
  } catch {
    /* ignore */
  }
}

export function clearSubmitted(versionId: string): void {
  try {
    storage()?.removeItem(doneKey(versionId));
  } catch {
    /* ignore */
  }
}

/** Removes saved data that belongs to older survey versions. */
export function purgeOtherVersions(keepVersionId: string): void {
  const s = storage();
  if (!s) return;
  try {
    const stale: string[] = [];
    for (let i = 0; i < s.length; i++) {
      const key = s.key(i);
      if (key && key.startsWith(PREFIX) && !key.endsWith(`:${keepVersionId}`)) stale.push(key);
    }
    stale.forEach((key) => s.removeItem(key));
  } catch {
    /* ignore */
  }
}
