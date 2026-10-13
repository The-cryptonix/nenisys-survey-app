import { config } from '../config';

/**
 * Plain-language legal text. Written to fit any Nenisys survey, not one topic.
 * Have it reviewed (including under the Nigeria Data Protection Act) before launch,
 * and bump config.legalUpdated whenever it changes.
 */

export type LegalId = 'terms' | 'privacy' | 'usage';

export interface LegalDoc {
  title: string;
  summary: string;
  /** A string is a paragraph; a string[] is a bullet list. */
  sections: { heading: string; body: (string | string[])[] }[];
}

export const LEGAL_ORDER: LegalId[] = ['terms', 'privacy', 'usage'];

export const LEGAL: Record<LegalId, LegalDoc> = {
  terms: {
    title: 'Terms of Use',
    summary: 'The simple rules for taking this survey. Taking part is voluntary, and you can stop at any time.',
    sections: [
      {
        heading: 'Who runs this survey',
        body: [
          'This survey is run by Nenisys, a technology company based in Port Harcourt, Nigeria. In these terms, "we" and "us" mean Nenisys.',
        ],
      },
      {
        heading: 'Taking part is your choice',
        body: [
          'You do not have to take part. You can stop at any time by closing the page, and nothing is sent to us until you press Submit. You can skip any question marked Optional.',
        ],
      },
      {
        heading: 'Who can take part',
        body: ['Please take part only if you are 18 or older, or you have permission from a parent or guardian.'],
      },
      {
        heading: 'What we ask of you',
        body: [
          'Please:',
          [
            'Answer honestly and for yourself, once.',
            'Do not type anyone else\'s personal details, or anything unlawful, abusive or misleading.',
            'Do not try to overload, bypass or break the survey, for example with bots or automated tools.',
          ],
        ],
      },
      {
        heading: 'When you press Submit',
        body: [
          'By pressing Submit you allow us to use your answers as explained in the Privacy Notice and in How we use your answers.',
          'The survey is anonymous. After you submit, we cannot tell which answers are yours, so we cannot change or withdraw an individual response afterwards.',
        ],
      },
      {
        heading: 'The survey can change',
        body: [
          'We try to keep the survey working, but we cannot promise it will always be available. We may pause, change or close it at any time. If we update it while you are answering, we will load the latest version and keep your answers where they still fit.',
        ],
      },
      {
        heading: 'No advice, no promises',
        body: [
          'The survey is for research. Nothing in it is financial, legal or investment advice. Taking part does not create a contract, and it does not give you any right to a product, account or reward.',
        ],
      },
      {
        heading: 'Our content',
        body: ['The text and design of this page belong to Nenisys unless we say otherwise.'],
      },
      {
        heading: 'Changes to these terms',
        body: ['We may update these terms. The date above shows the latest version. Changes apply to responses sent after the update.'],
      },
    ],
  },

  privacy: {
    title: 'Privacy Notice',
    summary: 'What we collect, why, who can see it, and how long we keep it. The short version: the survey is anonymous.',
    sections: [
      {
        heading: 'The short version',
        body: [
          [
            'We do not ask for your name or email address.',
            'We do not use cookies, analytics or advertising trackers on this page. The one outside service involved is a bot check from Cloudflare, which runs when you reach the last question.',
            'Your answers are not linked to you, your device or your connection.',
            'Typed answers can contain personal details if you write them, so please do not.',
          ],
        ],
      },
      {
        heading: 'What we collect',
        body: [
          'Your answers: the options you choose, and any text you type into an "Other" box.',
          'To keep the survey working and safe, our system also handles a few technical items. None of them is stored together with your name or your raw connection details:',
          [
            'A random one-time code your browser creates when you submit, so that a retry can never count twice. We keep only a scrambled (hashed) version of it.',
            'A scrambled (hashed) fingerprint of your answers, used to spot the same response being sent twice.',
            'A scrambled (hashed) identifier derived from your connection, used only to limit abuse. We never store your raw IP address.',
            'A one-time pass from Cloudflare Turnstile, which our service checks to tell people from bots. We do not keep it with your answers.',
          ],
        ],
      },
      {
        heading: 'What is saved on your device',
        body: [
          'While you answer, this page saves your progress in your browser\'s local storage, so you can return to it. It also saves a small marker after you submit, so the page can tell you that you have already responded.',
          'This stays on your device. We do not receive it. It is removed when you submit, when you press Start over, or when you clear your browser data. A saved draft older than 7 days is ignored and cleared the next time you open the survey. We set no cookies of our own.',
          'The fonts on this page are served from our own site, not from Google or any other font service.',
        ],
      },
      {
        heading: 'Why we use it',
        body: [
          'To run the survey, to understand the results across everyone who answered, and to keep the survey secure and free from spam. See How we use your answers for detail.',
        ],
      },
      {
        heading: 'Who can see it',
        body: [
          'Only authorised Nenisys team members who run the survey can see the responses. We use these providers to run it: Vercel hosts this page and the survey service, and Neon hosts the database. They handle data on our behalf. Cloudflare runs the bot check (Turnstile) on the last question. Cloudflare and our hosting providers also see technical connection details, such as your IP address, when you load a page or the check; we do not store those with your answers.',
          'We do not sell your data, and we do not share individual responses with advertisers.',
        ],
      },
      {
        heading: 'How long we keep it',
        body: [
          `We plan to delete or anonymise the responses within ${config.retentionDays} days after the survey closes. If that changes, this page will say so.`,
        ],
      },
      {
        heading: 'Your choices',
        body: [
          'Because answers are anonymous, we cannot look up or return "your" response. If you typed personal details into an "Other" box and want them removed, email us and tell us what the text said. We can redact it.',
          'You can clear your saved progress at any time with the Start over button, or by clearing this site\'s data in your browser.',
        ],
      },
      {
        heading: 'Security',
        body: [
          'Connections are encrypted (HTTPS). Our server checks every submission against the published survey before saving it. Survey data is kept separate from our other products.',
        ],
      },
      {
        heading: 'Changes to this notice',
        body: ['If we change this notice, the date above will change. We will not use your answers in ways this notice does not describe.'],
      },
    ],
  },

  usage: {
    title: 'How we use your answers',
    summary: 'What happens to your answers after you press Submit, and what we will not do with them.',
    sections: [
      {
        heading: 'What happens when you press Submit',
        body: [
          [
            'Your browser sends your answers to our survey service over an encrypted connection.',
            'Our server checks that they match the published survey, so nobody can send answers to questions that do not exist, and then saves them.',
            'We add up the answers across everyone who took part, as counts and percentages for each question.',
            'We use those results to understand what people think and need, and to make better decisions and products.',
          ],
        ],
      },
      {
        heading: 'What we will not do',
        body: [
          [
            'Build a profile of you, or link your answers to an account, email address or other data.',
            'Sell your answers, or use them for advertising.',
            'Use your answers to make automated decisions about you.',
            'Publish individual responses.',
          ],
        ],
      },
      {
        heading: 'Typed answers',
        body: [
          'Answers you type into an "Other" box may be read by a person on our team, and grouped into themes. If we ever quote one, we will first remove anything that could identify someone.',
        ],
      },
      {
        heading: 'Sharing results',
        body: ['When we share or publish results, they are in summary form only, such as totals and percentages.'],
      },
      {
        heading: 'Skipped questions',
        body: ['Questions you skip are simply left blank. Skipping an optional question has no effect on anything else.'],
      },
      {
        heading: 'After you submit',
        body: [
          'Because we cannot tell which response is yours, we cannot edit or remove one afterwards. Please check your answers before you press Submit.',
        ],
      },
    ],
  },
};
