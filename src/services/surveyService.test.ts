import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SubmissionPayload } from '../types';

const payload: SubmissionPayload = { surveyVersionId: 'v1', answers: [{ questionId: 'q1', optionIds: ['a'] }] };
const KEY = 'abcdefghijklmnop1234';

async function loadService() {
  vi.resetModules();
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.test');
  return (await import('./surveyService')).surveyService;
}

function reply(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('surveyService.submit and the human check', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('window', globalThis);
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('sends the Turnstile token next to the Idempotency-Key', async () => {
    fetchMock.mockResolvedValue(reply(201, { status: 'received' }));
    const service = await loadService();
    await service.submit(payload, KEY, { verificationToken: 'tok-123' });
    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Record<string, string>;
    expect(headers['X-Turnstile-Token']).toBe('tok-123');
    expect(headers['Idempotency-Key']).toBe(KEY);
  });

  it('leaves the header out when there is no token', async () => {
    fetchMock.mockResolvedValue(reply(201, { status: 'received' }));
    const service = await loadService();
    await service.submit(payload, KEY, { verificationToken: null });
    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Record<string, string>;
    expect(headers).not.toHaveProperty('X-Turnstile-Token');
  });

  it('maps a failed human check to its own friendly error, not "closed"', async () => {
    fetchMock.mockResolvedValue(reply(403, { error: 'verification_failed' }));
    const service = await loadService();
    const error = await service.submit(payload, KEY, { verificationToken: 'bad' }).catch((e: unknown) => e);
    expect(error).toMatchObject({ kind: 'verification' });
    expect((error as Error).message).not.toMatch(/verification_failed/);
  });

  it('still treats other 403 replies as closed', async () => {
    fetchMock.mockResolvedValue(reply(403, { error: 'survey_closed' }));
    const service = await loadService();
    const error = await service.submit(payload, KEY, { verificationToken: 'tok' }).catch((e: unknown) => e);
    expect(error).toMatchObject({ kind: 'closed' });
  });
});
