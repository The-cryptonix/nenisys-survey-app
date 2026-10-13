import { describe, expect, it } from 'vitest';
import type { SurveyOption, SurveyQuestion } from '../types';
import {
  buildPayload,
  reconcileAnswers,
  selectionHint,
  toggleOption,
  validateAll,
  validateQuestion,
  visibleQuestions,
} from './answers';

const opt = (id: string, kind: SurveyOption['kind'] = 'normal', extra: Partial<SurveyOption> = {}): SurveyOption => ({
  id,
  label: id,
  kind,
  otherRequired: false,
  otherMaxLength: 20,
  ...extra,
});

const q = (id: string, over: Partial<SurveyQuestion> = {}): SurveyQuestion => ({
  id,
  type: 'single_choice',
  prompt: id,
  description: null,
  required: true,
  minSelections: null,
  maxSelections: null,
  visibleIf: null,
  options: [opt(`${id}-a`), opt(`${id}-b`)],
  ...over,
});

const pick = (...optionIds: string[]) => ({ optionIds, otherText: '' });

describe('visibility', () => {
  const q1 = q('q1');
  const q2 = q('q2', { visibleIf: { questionId: 'q1', anyOfOptionIds: ['q1-a'] } });

  it('hides a dependent question until its trigger is selected', () => {
    expect(visibleQuestions([q1, q2], {}).map((x) => x.id)).toEqual(['q1']);
    expect(visibleQuestions([q1, q2], { q1: pick('q1-b') }).map((x) => x.id)).toEqual(['q1']);
    expect(visibleQuestions([q1, q2], { q1: pick('q1-a') }).map((x) => x.id)).toEqual(['q1', 'q2']);
  });

  it('does not validate hidden questions', () => {
    expect(validateAll([q1, q2], { q1: pick('q1-b') })).toEqual({});
  });
});

describe('validation', () => {
  it('requires an answer only when required', () => {
    expect(validateQuestion(q('a'), undefined)).toBe('required');
    expect(validateQuestion(q('a', { required: false }), undefined)).toBeNull();
  });

  it('enforces min and max selections', () => {
    const multi = q('m', {
      type: 'multiple_choice',
      minSelections: 2,
      maxSelections: 2,
      options: [opt('a'), opt('b'), opt('c')],
    });
    expect(validateQuestion(multi, pick('a'))).toBe('too_few_selections');
    expect(validateQuestion(multi, pick('a', 'b', 'c'))).toBe('too_many_selections');
    expect(validateQuestion(multi, pick('a', 'b'))).toBeNull();
  });

  it('rejects an exclusive option combined with others', () => {
    const multi = q('m', { type: 'checklist', options: [opt('a'), opt('none', 'none')] });
    expect(validateQuestion(multi, pick('a', 'none'))).toBe('exclusive_option_conflict');
  });

  it('checks the Other text', () => {
    const withOther = (otherRequired: boolean) =>
      q('o', { type: 'multiple_choice', options: [opt('a'), opt('other', 'other', { otherRequired })] });
    expect(validateQuestion(withOther(true), pick('other'))).toBe('other_required');
    expect(validateQuestion(withOther(false), pick('other'))).toBeNull();
    expect(validateQuestion(withOther(false), { optionIds: ['other'], otherText: 'x'.repeat(21) })).toBe('other_too_long');
    expect(validateQuestion(withOther(false), { optionIds: ['other'], otherText: 'ab\u0007' })).toBe('other_invalid');
    expect(validateQuestion(withOther(true), { optionIds: ['other'], otherText: '  fine  ' })).toBeNull();
  });
});

describe('toggleOption', () => {
  const multi = q('m', { type: 'multiple_choice', options: [opt('a'), opt('b'), opt('none', 'none')] });

  it('makes the none option exclusive', () => {
    expect(toggleOption(multi, pick('a', 'b'), 'none').optionIds).toEqual(['none']);
    expect(toggleOption(multi, pick('none'), 'a').optionIds).toEqual(['a']);
  });

  it('stops at the maximum', () => {
    const capped = q('c', { type: 'multiple_choice', maxSelections: 2, options: [opt('a'), opt('b'), opt('c')] });
    expect(toggleOption(capped, pick('a', 'b'), 'c').optionIds).toEqual(['a', 'b']);
  });

  it('replaces the choice on single-choice questions and clears Other text', () => {
    const single = q('s', { options: [opt('a'), opt('other', 'other')] });
    const withText = { optionIds: ['other'], otherText: 'hello' };
    expect(toggleOption(single, withText, 'a')).toEqual({ optionIds: ['a'], otherText: '' });
  });
});

describe('buildPayload', () => {
  it('sends visible answers only, with trimmed Other text', () => {
    const q1 = q('q1');
    const q2 = q('q2', { visibleIf: { questionId: 'q1', anyOfOptionIds: ['q1-a'] } });
    const q3 = q('q3', { type: 'multiple_choice', required: false, options: [opt('x'), opt('o', 'other')] });
    const payload = buildPayload('v1', [q1, q2, q3], {
      q1: pick('q1-b'),
      q2: pick('q2-a'),
      q3: { optionIds: ['o'], otherText: '  hi  ' },
    });
    expect(payload).toEqual({
      surveyVersionId: 'v1',
      answers: [
        { questionId: 'q1', optionIds: ['q1-b'] },
        { questionId: 'q3', optionIds: ['o'], other: { optionId: 'o', text: 'hi' } },
      ],
    });
  });
});

describe('reconcileAnswers', () => {
  it('drops answers that no longer fit the survey', () => {
    const cleaned = reconcileAnswers({ q1: pick('q1-a'), gone: pick('x'), q2: pick('missing') }, [q('q1'), q('q2')]);
    expect(cleaned).toEqual({ q1: pick('q1-a') });
  });
});

describe('selectionHint', () => {
  it('describes the rules in plain words', () => {
    const three = [opt('a'), opt('b'), opt('c')];
    expect(selectionHint(q('s'))).toBe('Choose one answer.');
    expect(selectionHint(q('m', { type: 'multiple_choice', options: three }))).toBe('Select all that apply.');
    expect(selectionHint(q('m', { type: 'multiple_choice', maxSelections: 2, options: three }))).toBe('Choose up to 2.');
    expect(selectionHint(q('m', { type: 'multiple_choice', minSelections: 2, options: three }))).toBe('Choose at least 2.');
    expect(selectionHint(q('m', { type: 'multiple_choice', minSelections: 2, maxSelections: 2, options: three }))).toBe('Choose exactly 2.');
  });
});
