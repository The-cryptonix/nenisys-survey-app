import { AlertIcon, CheckIcon, ClockIcon, InboxIcon, LockIcon, RefreshIcon } from '../components/Icons';
import { HumanCheck } from '../components/HumanCheck';
import { QuestionStep } from '../components/QuestionStep';
import { LoadingPanel, StatePanel } from '../components/StatePanel';
import type { SurveyController } from '../hooks/useSurvey';
import { formatDateTime, isPast } from '../lib/format';
import { Intro } from './Intro';

export function SurveyView({ s }: { s: SurveyController }) {
  const { phase } = s;

  switch (phase.name) {
    case 'loading':
      return <LoadingPanel />;

    case 'failed':
      return (
        <StatePanel
          tone="danger"
          icon={<AlertIcon />}
          title="We could not load the survey"
          actions={
            <button type="button" className="btn p" onClick={() => void s.reload()}>
              <RefreshIcon />
              Try again
            </button>
          }
        >
          {phase.error.message}
        </StatePanel>
      );

    case 'unavailable':
      return (
        <StatePanel icon={<InboxIcon />} title="No survey is open right now">
          There is no survey to take at the moment. Please check back soon.
        </StatePanel>
      );

    case 'closed': {
      const when = formatDateTime(phase.closesAt);
      return (
        <StatePanel tone="warn" icon={<LockIcon />} title="This survey has closed">
          {isPast(phase.closesAt) && when ? `It stopped taking responses on ${when}. ` : ''}
          Thank you for your interest. It is no longer accepting responses.
        </StatePanel>
      );
    }

    case 'not_open': {
      const when = formatDateTime(phase.opensAt);
      return (
        <StatePanel icon={<ClockIcon />} title="This survey has not opened yet">
          {when ? `It opens on ${when}. Please come back then.` : 'Please check back soon.'}
        </StatePanel>
      );
    }

    case 'already_submitted':
      return (
        <StatePanel
          tone="success"
          icon={<CheckIcon />}
          title="You have already responded"
          actions={
            <button type="button" className="btn s" onClick={s.respondAgain}>
              Someone else is using this device
            </button>
          }
        >
          Thank you. This device has already sent a response, so there is nothing more to do.
        </StatePanel>
      );

    case 'thanks':
      return (
        <StatePanel tone="success" icon={<CheckIcon />} title="Thank you. We have your response.">
          Your answers were sent anonymously. You can close this page now.
        </StatePanel>
      );

    case 'ready':
      if (s.stage === 'questions' && s.current) {
        const hc = s.humanCheck;
        const last = s.index === s.visible.length - 1;
        return (
          <QuestionStep
            question={s.current}
            index={s.index}
            total={s.visible.length}
            answer={s.answers[s.current.id]}
            issue={s.issues[s.current.id]}
            isLast={last}
            submitting={s.submitting}
            submitError={s.submitError}
            extra={
              last && hc.enabled ? (
                <HumanCheck
                  siteKey={hc.siteKey}
                  ready={hc.ready}
                  unavailable={hc.unavailable}
                  attempt={hc.attempt}
                  onToken={hc.onToken}
                  onUnavailable={hc.onUnavailable}
                  onRetry={hc.retry}
                  disabled={s.submitting}
                />
              ) : null
            }
            submitBlocked={last && hc.enabled && !hc.ready}
            onToggle={(optionId) => s.current && s.toggle(s.current, optionId)}
            onOtherText={(text) => s.current && s.setOtherText(s.current, text)}
            onClear={() => s.current && s.clearAnswer(s.current)}
            onBack={s.back}
            onNext={s.next}
          />
        );
      }
      return (
        <Intro
          survey={phase.survey}
          consent={s.consent}
          consentError={s.consentError}
          hasDraft={s.hasDraft}
          onConsent={s.setConsent}
          onStart={s.start}
          onStartOver={s.startOver}
        />
      );
  }
}
