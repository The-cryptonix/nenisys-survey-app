import { AppError, toAppError, type ServerIssue } from '../errors';
import type {
  ActiveSurveyResult,
  OpenSurvey,
  OptionKind,
  QuestionType,
  SubmissionPayload,
  SubmitResult,
  SurveyOption,
  SurveyQuestion,
} from '../types';
import { requestJson, type HttpResult } from './http';

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isString = (v: unknown): v is string => typeof v === 'string';
const positiveInt = (v: unknown): number | null =>
  typeof v === 'number' && Number.isInteger(v) && v >= 1 ? v : null;

const QUESTION_TYPES: readonly string[] = ['single_choice', 'multiple_choice', 'checklist'];
const OPTION_KINDS: readonly string[] = ['normal', 'other', 'none'];

function parseOption(v: unknown): SurveyOption | null {
  if (!isRecord(v)) return null;
  const { id, label, kind, otherMaxLength } = v;
  if (!isString(id) || !isString(label) || !isString(kind) || !OPTION_KINDS.includes(kind)) return null;
  const max = typeof otherMaxLength === 'number' ? Math.min(Math.max(Math.floor(otherMaxLength), 1), 500) : 200;
  return { id, label, kind: kind as OptionKind, otherRequired: v.otherRequired === true, otherMaxLength: max };
}

function parseQuestion(v: unknown): SurveyQuestion | null {
  if (!isRecord(v)) return null;
  const { id, type, prompt, description, visibleIf } = v;
  if (!isString(id) || !isString(type) || !QUESTION_TYPES.includes(type) || !isString(prompt)) return null;

  let parsedVisibleIf: SurveyQuestion['visibleIf'] = null;
  if (visibleIf !== null && visibleIf !== undefined) {
    if (
      !isRecord(visibleIf) ||
      !isString(visibleIf.questionId) ||
      !Array.isArray(visibleIf.anyOfOptionIds) ||
      !visibleIf.anyOfOptionIds.every(isString)
    ) {
      return null;
    }
    parsedVisibleIf = { questionId: visibleIf.questionId, anyOfOptionIds: visibleIf.anyOfOptionIds };
  }

  if (!Array.isArray(v.options) || v.options.length === 0) return null;
  const options: SurveyOption[] = [];
  for (const raw of v.options) {
    const option = parseOption(raw);
    if (!option) return null;
    options.push(option);
  }

  return {
    id,
    type: type as QuestionType,
    prompt,
    description: isString(description) && description.trim() !== '' ? description : null,
    required: v.required === true,
    minSelections: positiveInt(v.minSelections),
    maxSelections: positiveInt(v.maxSelections),
    visibleIf: parsedVisibleIf,
    options,
  };
}

/** Returns null for anything this version of the app cannot render safely (e.g. an unknown question type). */
function parseOpenSurvey(data: Record<string, unknown>): OpenSurvey | null {
  if (!isString(data.versionId) || !Array.isArray(data.questions)) return null;
  const questions: SurveyQuestion[] = [];
  for (const raw of data.questions) {
    const q = parseQuestion(raw);
    if (!q) return null;
    questions.push(q);
  }
  return { versionId: data.versionId, closesAt: isString(data.closesAt) ? data.closesAt : null, questions };
}

function parseIssues(data: unknown): ServerIssue[] {
  if (!isRecord(data) || !Array.isArray(data.issues)) return [];
  const issues: ServerIssue[] = [];
  for (const raw of data.issues.slice(0, 100)) {
    if (isRecord(raw) && isString(raw.code)) {
      issues.push(isString(raw.questionId) ? { questionId: raw.questionId, code: raw.code } : { code: raw.code });
    }
  }
  return issues;
}

function submitError(res: HttpResult): AppError {
  const code = isRecord(res.data) && isString(res.data.error) ? res.data.error : '';
  switch (res.status) {
    case 403:
      if (code === 'verification_failed') return new AppError('verification');
      return new AppError(code === 'survey_not_open' ? 'not_open' : 'closed');
    case 404:
      return new AppError('unavailable');
    case 409:
      return new AppError(code === 'survey_version_outdated' ? 'outdated' : 'conflict');
    case 422:
      return new AppError('validation', { issues: parseIssues(res.data) });
    case 429:
      return new AppError('rate_limited', { retryAfterSeconds: res.retryAfterSeconds });
    default:
      return new AppError(res.status >= 500 ? 'server' : 'client');
  }
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

/** Retries only transient failures (network, timeout, 5xx). Safe for submit because the Idempotency-Key is reused. */
async function withRetry<T>(fn: () => Promise<T>, attempts: number, signal?: AbortSignal): Promise<T> {
  let last: AppError = new AppError('server');
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      last = toAppError(e);
      if (!last.transient || signal?.aborted || i === attempts - 1) throw last;
      await sleep(800 * 2 ** i, signal);
    }
  }
  throw last;
}

export const surveyService = {
  async getActive(signal?: AbortSignal): Promise<ActiveSurveyResult> {
    const res = await withRetry(
      async () => {
        const r = await requestJson('/survey/active', { signal });
        if (r.status >= 500) throw new AppError('server');
        return r;
      },
      2,
      signal,
    );

    if (res.status === 404) return { kind: 'unavailable' };
    if (res.status === 429) throw new AppError('rate_limited', { retryAfterSeconds: res.retryAfterSeconds });
    if (res.status !== 200 || !isRecord(res.data)) throw new AppError('bad_response');

    const data = res.data;
    switch (data.status) {
      case 'closed':
        return { kind: 'closed', closesAt: isString(data.closesAt) ? data.closesAt : null };
      case 'not_open':
        return { kind: 'not_open', opensAt: isString(data.opensAt) ? data.opensAt : null };
      case 'open': {
        const survey = parseOpenSurvey(data);
        if (!survey) throw new AppError('bad_response');
        return { kind: 'open', survey };
      }
      default:
        throw new AppError('bad_response');
    }
  },

  async submit(
    payload: SubmissionPayload,
    idempotencyKey: string,
    opts: { verificationToken?: string | null; signal?: AbortSignal } = {},
  ): Promise<SubmitResult> {
    const { verificationToken, signal } = opts;
    const res = await withRetry(
      async () => {
        const r = await requestJson('/survey/submit', {
          method: 'POST',
          body: payload,
          // The same Idempotency-Key and Turnstile token are reused on retries of one attempt. The backend
          // treats a retry of an already-saved response as a duplicate instead of re-checking the token.
          headers: {
            'Idempotency-Key': idempotencyKey,
            ...(verificationToken ? { 'X-Turnstile-Token': verificationToken } : {}),
          },
          signal,
        });
        if (r.status >= 500) throw new AppError('server');
        return r;
      },
      3,
      signal,
    );

    if (res.status === 201) return { duplicate: false };
    if (res.status === 200 && isRecord(res.data) && res.data.status === 'received') {
      return { duplicate: res.data.duplicate === true };
    }
    throw submitError(res);
  },
};
