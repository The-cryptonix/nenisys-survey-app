import type { AnswerPayload, SurveyOption, SurveyQuestion } from '../types';

/** Answer state and rules. These mirror the backend validator; the server still has the final say. */

export interface AnswerState {
  optionIds: string[];
  otherText: string;
}
export type Answers = Record<string, AnswerState>;

export const EMPTY: AnswerState = { optionIds: [], otherText: '' };

export type IssueCode =
  | 'required'
  | 'too_few_selections'
  | 'too_many_selections'
  | 'exclusive_option_conflict'
  | 'other_required'
  | 'other_invalid'
  | 'other_too_long';

const CONTROL_CHARS = /[\u0000-\u001F\u007F-\u009F]/;

export const normaliseOther = (text: string): string => text.normalize('NFC').trim();

export function otherOptionOf(q: SurveyQuestion): SurveyOption | undefined {
  return q.options.find((o) => o.kind === 'other');
}

export function hasAnyAnswer(answers: Answers): boolean {
  return Object.values(answers).some((a) => a.optionIds.length > 0);
}

/** A question is visible when it has no condition, or an earlier visible question has one of the listed options selected. */
export function visibleQuestions(questions: SurveyQuestion[], answers: Answers): SurveyQuestion[] {
  const selected = new Map<string, Set<string>>();
  const visible: SurveyQuestion[] = [];
  for (const q of questions) {
    let show = true;
    if (q.visibleIf) {
      const picked = selected.get(q.visibleIf.questionId);
      show = !!picked && q.visibleIf.anyOfOptionIds.some((id) => picked.has(id));
    }
    if (!show) continue;
    visible.push(q);
    selected.set(q.id, new Set(answers[q.id]?.optionIds ?? []));
  }
  return visible;
}

export function selectionLimits(q: SurveyQuestion): { min: number; max: number } {
  if (q.type === 'single_choice') return { min: 1, max: 1 };
  return {
    min: Math.max(q.minSelections ?? 1, 1),
    max: Math.min(q.maxSelections ?? q.options.length, q.options.length),
  };
}

export function selectionHint(q: SurveyQuestion): string {
  if (q.type === 'single_choice') return 'Choose one answer.';
  const { min, max } = selectionLimits(q);
  const hasMax = max < q.options.length;
  const hasMin = min > 1;
  if (max === 1) return 'Choose one answer.';
  if (hasMax && hasMin) return min === max ? `Choose exactly ${min}.` : `Choose ${min} to ${max}.`;
  if (hasMax) return `Choose up to ${max}.`;
  if (hasMin) return `Choose at least ${min}.`;
  return 'Select all that apply.';
}

export function toggleOption(q: SurveyQuestion, current: AnswerState | undefined, optionId: string): AnswerState {
  const cur = current ?? EMPTY;
  const option = q.options.find((o) => o.id === optionId);
  if (!option) return cur;

  let ids: string[];
  if (q.type === 'single_choice') {
    ids = [optionId];
  } else if (cur.optionIds.includes(optionId)) {
    ids = cur.optionIds.filter((id) => id !== optionId);
  } else if (option.kind === 'none') {
    ids = [optionId];
  } else {
    const noneIds = new Set(q.options.filter((o) => o.kind === 'none').map((o) => o.id));
    ids = [...cur.optionIds.filter((id) => !noneIds.has(id)), optionId];
    if (ids.length > selectionLimits(q).max) return cur;
  }

  const other = otherOptionOf(q);
  return { optionIds: ids, otherText: other && ids.includes(other.id) ? cur.otherText : '' };
}

export function validateQuestion(q: SurveyQuestion, answer: AnswerState | undefined): IssueCode | null {
  const ids = answer?.optionIds ?? [];
  if (ids.length === 0) return q.required ? 'required' : null;

  const { min, max } = selectionLimits(q);
  if (ids.length > max) return 'too_many_selections';
  if (ids.length < min) return 'too_few_selections';

  const selected = q.options.filter((o) => ids.includes(o.id));
  if (selected.length > 1 && selected.some((o) => o.kind === 'none')) return 'exclusive_option_conflict';

  const other = selected.find((o) => o.kind === 'other');
  if (other) {
    const text = normaliseOther(answer?.otherText ?? '');
    if (text === '') return other.otherRequired ? 'other_required' : null;
    if (CONTROL_CHARS.test(text)) return 'other_invalid';
    if ([...text].length > other.otherMaxLength) return 'other_too_long';
  }
  return null;
}

/** Issues for every visible question, keyed by question id. */
export function validateAll(questions: SurveyQuestion[], answers: Answers): Record<string, IssueCode> {
  const issues: Record<string, IssueCode> = {};
  for (const q of visibleQuestions(questions, answers)) {
    const code = validateQuestion(q, answers[q.id]);
    if (code) issues[q.id] = code;
  }
  return issues;
}

export function buildPayload(versionId: string, questions: SurveyQuestion[], answers: Answers) {
  const out: AnswerPayload[] = [];
  for (const q of visibleQuestions(questions, answers)) {
    const a = answers[q.id];
    if (!a || a.optionIds.length === 0) continue;
    const entry: AnswerPayload = { questionId: q.id, optionIds: [...a.optionIds] };
    const other = otherOptionOf(q);
    if (other && a.optionIds.includes(other.id)) {
      const text = normaliseOther(a.otherText);
      if (text !== '') entry.other = { optionId: other.id, text };
    }
    out.push(entry);
  }
  return { surveyVersionId: versionId, answers: out };
}

/** Keeps only answers that still fit the survey (after a version change or a restored draft). */
export function reconcileAnswers(answers: Answers, questions: SurveyQuestion[]): Answers {
  const out: Answers = {};
  for (const q of questions) {
    const a = answers[q.id];
    if (!a) continue;
    const known = new Set(q.options.map((o) => o.id));
    const ids = a.optionIds.filter((id) => known.has(id));
    if (ids.length === 0) continue;
    const other = otherOptionOf(q);
    out[q.id] = { optionIds: ids, otherText: other && ids.includes(other.id) ? a.otherText : '' };
  }
  return out;
}

export function issueMessage(code: string, q?: SurveyQuestion): string {
  const limits = q ? selectionLimits(q) : null;
  switch (code) {
    case 'required':
      return 'Please answer this question to continue.';
    case 'too_few_selections':
      return limits ? `Please choose at least ${limits.min}.` : 'Please choose more answers.';
    case 'too_many_selections':
      return limits ? `Please choose no more than ${limits.max}.` : 'Please choose fewer answers.';
    case 'exclusive_option_conflict':
      return 'That option cannot be combined with others. Please pick one or the other.';
    case 'other_required':
      return 'Please type your answer in the box.';
    case 'other_invalid':
      return 'Your answer has a character we cannot accept. Please remove it and try again.';
    case 'other_too_long':
      return 'Your answer is a little too long. Please shorten it.';
    default:
      return 'Please check this answer and try again.';
  }
}
