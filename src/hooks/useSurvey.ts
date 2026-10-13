import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '../components/Toasts';
import { AppError, toAppError } from '../errors';
import {
  buildPayload,
  hasAnyAnswer,
  reconcileAnswers,
  toggleOption,
  validateAll,
  validateQuestion,
  visibleQuestions,
  EMPTY,
  type Answers,
} from '../lib/answers';
import {
  clearDraft,
  clearSubmitted,
  isSubmitted,
  loadDraft,
  markSubmitted,
  purgeOtherVersions,
  saveDraft,
  type Draft,
} from '../lib/draft';
import { surveyService } from '../services/surveyService';
import type { OpenSurvey, SurveyQuestion } from '../types';

export type Phase =
  | { name: 'loading' }
  | { name: 'failed'; error: AppError }
  | { name: 'unavailable' }
  | { name: 'closed'; closesAt: string | null }
  | { name: 'not_open'; opensAt: string | null }
  | { name: 'already_submitted'; survey: OpenSurvey }
  | { name: 'ready'; survey: OpenSurvey }
  | { name: 'thanks' };

type Stage = 'intro' | 'questions';
type LoadMode = 'fresh' | 'reload';

function newKey(): string {
  const c = globalThis.crypto;
  if (typeof c.randomUUID === 'function') return c.randomUUID();
  const bytes = new Uint8Array(16);
  c.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function useSurvey() {
  const { push } = useToast();

  const [phase, setPhase] = useState<Phase>({ name: 'loading' });
  const [stage, setStage] = useState<Stage>('intro');
  const [answers, setAnswers] = useState<Answers>({});
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [issues, setIssues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<AppError | null>(null);
  const [hasDraft, setHasDraft] = useState(false);

  const answersRef = useRef(answers);
  const currentIdRef = useRef(currentId);
  const abortRef = useRef<AbortController | null>(null);
  const submittingRef = useRef(false);
  /** The same key is reused for retries of the same answers, so a retry can never create a second response. */
  const keyRef = useRef<{ canonical: string; key: string } | null>(null);

  useEffect(() => {
    answersRef.current = answers;
    currentIdRef.current = currentId;
  }, [answers, currentId]);

  const survey = phase.name === 'ready' ? phase.survey : null;
  const visible = useMemo(() => (survey ? visibleQuestions(survey.questions, answers) : []), [survey, answers]);
  const index = Math.max(0, visible.findIndex((q) => q.id === currentId));
  const current: SurveyQuestion | null = visible[index] ?? null;

  // Keep progress on this device while the survey is open.
  useEffect(() => {
    if (phase.name !== 'ready') return;
    if (!consent && !hasAnyAnswer(answers)) {
      clearDraft(phase.survey.versionId);
      return;
    }
    saveDraft(phase.survey.versionId, { answers, currentId, consent });
  }, [phase, answers, currentId, consent]);

  const applySurvey = useCallback((next: OpenSurvey, mode: LoadMode) => {
    if (next.questions.length === 0) {
      setPhase({ name: 'unavailable' });
      return;
    }
    purgeOtherVersions(next.versionId);

    let draft: Draft | null = null;
    let base: Answers;
    if (mode === 'reload') {
      base = answersRef.current;
    } else {
      if (isSubmitted(next.versionId)) {
        setPhase({ name: 'already_submitted', survey: next });
        return;
      }
      draft = loadDraft(next.versionId);
      base = draft?.answers ?? {};
    }

    const cleaned = reconcileAnswers(base, next.questions);
    const list = visibleQuestions(next.questions, cleaned);
    const wanted = mode === 'reload' ? currentIdRef.current : (draft?.currentId ?? null);

    setAnswers(cleaned);
    setCurrentId(list.some((q) => q.id === wanted) ? wanted : (list[0]?.id ?? null));
    if (mode === 'fresh') {
      setConsent(draft?.consent ?? false);
      setHasDraft(!!draft && hasAnyAnswer(cleaned));
    }
    setStage(mode === 'reload' ? 'questions' : 'intro');
    setConsentError(false);
    setIssues({});
    setSubmitError(null);
    keyRef.current = null;
    setPhase({ name: 'ready', survey: next });
  }, []);

  const load = useCallback(
    async (mode: LoadMode = 'fresh') => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      if (mode === 'fresh') setPhase({ name: 'loading' });

      try {
        const result = await surveyService.getActive(controller.signal);
        if (controller.signal.aborted) return;
        switch (result.kind) {
          case 'open':
            applySurvey(result.survey, mode);
            break;
          case 'closed':
            setPhase({ name: 'closed', closesAt: result.closesAt });
            break;
          case 'not_open':
            setPhase({ name: 'not_open', opensAt: result.opensAt });
            break;
          case 'unavailable':
            setPhase({ name: 'unavailable' });
            break;
        }
      } catch (e) {
        const error = toAppError(e);
        if (error.kind === 'aborted') return;
        push('error', error.message);
        setPhase({ name: 'failed', error });
      }
    },
    [applySurvey, push],
  );

  useEffect(() => {
    void load('fresh');
    return () => abortRef.current?.abort();
  }, [load]);

  const clearIssue = (questionId: string) =>
    setIssues((prev) => {
      if (!(questionId in prev)) return prev;
      const { [questionId]: _removed, ...rest } = prev;
      return rest;
    });

  const toggle = (q: SurveyQuestion, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [q.id]: toggleOption(q, prev[q.id], optionId) }));
    clearIssue(q.id);
    setSubmitError(null);
  };

  const setOtherText = (q: SurveyQuestion, text: string) => {
    setAnswers((prev) => ({ ...prev, [q.id]: { optionIds: prev[q.id]?.optionIds ?? [], otherText: text } }));
    clearIssue(q.id);
    setSubmitError(null);
  };

  const clearAnswer = (q: SurveyQuestion) => {
    setAnswers((prev) => ({ ...prev, [q.id]: EMPTY }));
    clearIssue(q.id);
  };

  const start = () => {
    if (!consent) {
      setConsentError(true);
      return;
    }
    setConsentError(false);
    setStage('questions');
  };

  const back = () => {
    if (index === 0) setStage('intro');
    else setCurrentId(visible[index - 1]?.id ?? null);
  };

  const handleSubmitError = (error: AppError) => {
    switch (error.kind) {
      case 'aborted':
        return;
      case 'closed':
        setPhase({ name: 'closed', closesAt: null });
        return;
      case 'not_open':
        setPhase({ name: 'not_open', opensAt: null });
        return;
      case 'unavailable':
        setPhase({ name: 'unavailable' });
        return;
      case 'outdated':
        push('info', error.message);
        void load('reload');
        return;
      case 'validation': {
        const byQuestion: Record<string, string> = {};
        for (const issue of error.issues) if (issue.questionId) byQuestion[issue.questionId] = issue.code;
        const first = visible.find((q) => byQuestion[q.id]);
        if (!first) {
          // The server disagrees about the questions themselves: get the latest version.
          push('info', new AppError('outdated').message);
          void load('reload');
          return;
        }
        setIssues(byQuestion);
        setCurrentId(first.id);
        push('error', error.message);
        return;
      }
      case 'conflict':
        keyRef.current = null;
        setSubmitError(error);
        push('error', error.message);
        return;
      default:
        setSubmitError(error);
        push('error', error.message);
    }
  };

  const submit = async () => {
    if (!survey || submittingRef.current) return;

    const found = validateAll(survey.questions, answers);
    const firstInvalid = visible.find((q) => found[q.id]);
    if (firstInvalid) {
      setIssues(found);
      setCurrentId(firstInvalid.id);
      push('error', new AppError('validation').message);
      return;
    }

    const payload = buildPayload(survey.versionId, survey.questions, answers);
    const canonical = JSON.stringify(payload);
    if (keyRef.current?.canonical !== canonical) keyRef.current = { canonical, key: newKey() };

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await surveyService.submit(payload, keyRef.current.key);
      markSubmitted(survey.versionId);
      clearDraft(survey.versionId);
      keyRef.current = null;
      setAnswers({});
      setHasDraft(false);
      setPhase({ name: 'thanks' });
    } catch (e) {
      handleSubmitError(toAppError(e));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const next = () => {
    if (!current) return;
    const code = validateQuestion(current, answers[current.id]);
    if (code) {
      setIssues((prev) => ({ ...prev, [current.id]: code }));
      return;
    }
    const upcoming = visible[index + 1];
    if (upcoming) setCurrentId(upcoming.id);
    else void submit();
  };

  const startOver = () => {
    if (!survey) return;
    clearDraft(survey.versionId);
    setAnswers({});
    setConsent(false);
    setHasDraft(false);
    setIssues({});
    setCurrentId(survey.questions[0]?.id ?? null);
  };

  const respondAgain = () => {
    if (phase.name === 'already_submitted') clearSubmitted(phase.survey.versionId);
    setAnswers({});
    setConsent(false);
    void load('fresh');
  };

  return {
    phase,
    stage,
    survey,
    visible,
    index,
    current,
    answers,
    issues,
    consent,
    consentError,
    hasDraft,
    submitting,
    submitError,
    setConsent,
    reload: () => load('fresh'),
    start,
    back,
    next,
    toggle,
    setOtherText,
    clearAnswer,
    startOver,
    respondAgain,
  };
}

export type SurveyController = ReturnType<typeof useSurvey>;
