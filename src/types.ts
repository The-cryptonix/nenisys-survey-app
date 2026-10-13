/** Shapes returned by, and sent to, the survey backend. Mirrors nenisys-backend-survey/src/survey. */

export type QuestionType = 'single_choice' | 'multiple_choice' | 'checklist';
export type OptionKind = 'normal' | 'other' | 'none';

export interface SurveyOption {
  id: string;
  label: string;
  kind: OptionKind;
  otherRequired: boolean;
  otherMaxLength: number;
}

export interface VisibleIf {
  questionId: string;
  anyOfOptionIds: string[];
}

export interface SurveyQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  description: string | null;
  required: boolean;
  minSelections: number | null;
  maxSelections: number | null;
  visibleIf: VisibleIf | null;
  options: SurveyOption[];
}

export interface OpenSurvey {
  versionId: string;
  closesAt: string | null;
  questions: SurveyQuestion[];
}

export type ActiveSurveyResult =
  | { kind: 'open'; survey: OpenSurvey }
  | { kind: 'closed'; closesAt: string | null }
  | { kind: 'not_open'; opensAt: string | null }
  | { kind: 'unavailable' };

export interface AnswerPayload {
  questionId: string;
  optionIds: string[];
  other?: { optionId: string; text: string };
}

export interface SubmissionPayload {
  surveyVersionId: string;
  answers: AnswerPayload[];
}

export interface SubmitResult {
  duplicate: boolean;
}
