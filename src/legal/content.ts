import { config } from '../config';

/**
 * Plain-language legal text. Written to fit any Nenisys survey, not one topic.
 * Have it reviewed (including under the Nigeria Data Protection Act 2023) before launch,
 * and bump config.legalUpdated whenever it changes.
 */

export type LegalId = 'terms' | 'privacy' | 'usage' | 'risk';

export interface LegalDoc {
  title: string;
  summary: string;
  /** A string is a paragraph; a string[] is a bullet list. */
  sections: { heading: string; body: (string | string[])[] }[];
}

export const LEGAL_ORDER: LegalId[] = ['terms', 'privacy', 'usage', 'risk'];

export const LEGAL: Record<LegalId, LegalDoc> = {
  terms: {
    title: 'Terms of Use',
    summary: 'The simple rules for taking this survey. Taking part is voluntary, and you can stop at any time.',
    sections: [
      {
        heading: 'Who runs this survey',
        body: [
          'This survey is run by Nenisys, a technology company based in Port Harcourt, Rivers State, Nigeria. In these terms, "we" and "us" mean Nenisys.',
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
        body: [
          'This survey is for adults aged 18 or over. Please do not take part if you are under 18. We do not check age, so we rely on you to answer this honestly.',
        ],
      },
      {
        heading: 'What we ask of you',
        body: [
          'Please:',
          [
            'Answer honestly and for yourself, once.',
            "Do not type anyone else's personal details, or anything unlawful, abusive or misleading.",
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
          'The survey is for research. Nothing in it is financial, legal or investment advice. Taking part does not create a contract, and it does not give you any right to a product, account or reward. Please also read the Risk Disclosure.',
        ],
      },
      {
        heading: 'Links and other services',
        body: [
          'This page links to our main site, to Mercora Edge and to our social accounts. Those sites and services have their own terms and privacy practices, and we are not responsible for them.',
        ],
      },
      {
        heading: 'Our content',
        body: ['The text and design of this page belong to Nenisys unless we say otherwise.'],
      },
      {
        heading: 'Limits on our responsibility',
        body: [
          'We provide the survey as it is, without promises that it will be error-free or always available. As far as the law allows, we are not responsible for any loss that comes from using the survey, being unable to use it, or relying on anything shown on this page. Nothing in these terms limits any right you have under law that cannot be limited.',
        ],
      },
      {
        heading: 'Governing law',
        body: ['These terms are governed by the laws of the Federal Republic of Nigeria.'],
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
        heading: 'Who is responsible for your data',
        body: [
          'Nenisys, Port Harcourt, Rivers State, Nigeria, decides how the survey data is used. You can reach us at the email address at the bottom of this page.',
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
          "While you answer, this page saves your progress in your browser's local storage, so you can return to it. It also saves a small marker after you submit, so the page can tell you that you have already responded.",
          'This stays on your device. We do not receive it. It is removed when you submit, when you press Start over, or when you clear your browser data. A saved draft older than 7 days is ignored and cleared the next time you open the survey. We set no cookies of our own.',
          'The fonts on this page are served from our own site, not from Google or any other font service.',
        ],
      },
      {
        heading: 'Why we use it, and our basis for doing so',
        body: [
          'To run the survey, to understand the results across everyone who answered, and to keep the survey secure and free from spam. See How we use your answers for detail.',
          'We rely on your consent, which you give by ticking the box before you start and by pressing Submit. For the technical items above, we also rely on our legitimate interest in keeping the survey secure and free from abuse.',
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
        heading: 'Where it is processed',
        body: [
          'Our providers may process data on servers outside Nigeria. We choose providers that protect data with encryption and access controls, and we share only what is needed to run the survey.',
        ],
      },
      {
        heading: 'How long we keep it',
        body: [
          `We plan to delete or anonymise the responses within ${config.retentionDays} days after the survey closes. If that changes, this page will say so.`,
          'Our database provider keeps a recovery history, so data we delete can remain in backups for a limited time until that history expires.',
        ],
      },
      {
        heading: 'Your choices and rights',
        body: [
          'Because answers are anonymous, we cannot look up or return "your" response. If you typed personal details into an "Other" box and want them removed, email us and tell us what the text said. We can redact it.',
          'You can clear your saved progress at any time with the Start over button, or by clearing this site\'s data in your browser.',
          'Where the Nigeria Data Protection Act applies to you, you have rights over your personal data, including to ask what we hold, to ask for correction or deletion, and to object to how it is used. If you are not happy with how we handle your data, you can complain to the Nigeria Data Protection Commission.',
        ],
      },
      {
        heading: 'The newsletter is separate',
        body: [
          'This survey does not collect email addresses. If you sign up for the Nenisys newsletter on our main site, that signup is covered by the privacy policy there, and it is never linked to your survey answers.',
        ],
      },
      {
        heading: 'Children',
        body: ['The survey is not meant for anyone under 18, and we do not knowingly collect data from children.'],
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

  risk: {
    title: 'Risk Disclosure',
    summary: 'Why trading involves risk, and what this survey and page do and do not offer.',
    sections: [
      {
        heading: 'Why this is here',
        body: [
          'Nenisys also builds Mercora Edge, a proprietary trading firm, and this page shows information about it. This disclosure applies to anything on this page about trading or Mercora Edge.',
        ],
      },
      {
        heading: 'Trading involves risk',
        body: [
          'Trading financial markets carries a substantial risk of loss and is not suitable for everyone. You can lose some or all of the money you put in, including any fees you pay. Past performance does not guarantee future results.',
        ],
      },
      {
        heading: 'No advice and no promise of profit',
        body: [
          'Nothing in this survey or on this page is financial, legal, tax or investment advice, or an offer or invitation to trade. We do not promise profit or income, and we do not promise that anyone will pass an evaluation, receive a funded account or be paid.',
        ],
      },
      {
        heading: 'Mercora Edge is not launched yet',
        body: [
          'Mercora Edge is in development. Features, rules, fees and the launch date can change. The evaluation and funded account rules will be published before launch. Please read them in full before you decide anything.',
        ],
      },
      {
        heading: 'Evaluations and funded accounts',
        body: [
          'Any evaluation or funded account will come with targets, loss limits and other rules. Meeting them can be difficult, and a breach can end an account. Reading a summary on this page is not a substitute for reading the full rules.',
        ],
      },
      {
        heading: 'Market and technology risk',
        body: [
          'Markets can move fast, gap and become illiquid. Trading platforms and data feeds can be delayed, interrupted or wrong, and orders may be filled at prices different from the ones you expected. Any of these can affect results.',
        ],
      },
      {
        heading: 'Availability and local law',
        body: [
          'Mercora Edge may not be available in every country. You are responsible for checking that taking part is allowed where you live, and for any tax that applies to you.',
        ],
      },
      {
        heading: 'Your survey answers',
        body: [
          'Answering the survey does not create an offer, a contract or any obligation for you or for us, and it does not reserve a place in any product.',
        ],
      },
      {
        heading: 'Get independent advice',
        body: ['If you are unsure whether trading is right for you, speak to a qualified, independent adviser first.'],
      },
    ],
  },
};
