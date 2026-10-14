/** Outbound links and launch info shown around the survey. Edit here only. */
export const MAIN_SITE_URL = 'https://nenisys.shop';
export const MERCORA_URL = 'https://nenisys.shop/#edge';
export const TIKTOK_URL = 'https://www.tiktok.com/@nenisys.com';
export const X_URL = 'https://x.com/NENISYS';

export const MERCORA_LAUNCH_LABEL = '30 October 2026';
const MERCORA_LAUNCH = new Date(2026, 9, 30, 0, 0, 0).getTime();

/** True until launch day, so "launching" wording disappears on its own afterwards. */
export const launchPending = () => Date.now() < MERCORA_LAUNCH;
