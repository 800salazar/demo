import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { getAiConfig } from '@/lib/ai/config';
beforeEach(()=>{
  vi.stubEnv('AI_MODEL','nvidia/nemotron-3.5-lightning-free');
  vi.stubEnv('AI_GATEWAY_API_KEY',''); vi.stubEnv('VERCEL_OIDC_TOKEN',''); vi.stubEnv('VERCEL','');
});
afterEach(()=>vi.unstubAllEnvs());
it('detects runtime OIDC on Vercel without requiring a build-time environment token',()=>{
  vi.stubEnv('VERCEL','1');
  expect(getAiConfig(new Headers({'x-vercel-oidc-token':'test-platform-token'}))).toMatchObject({available:true});
  expect(getAiConfig(new Headers())).toEqual({available:false});
});
it('does not treat a client-supplied OIDC header as configured outside Vercel',()=>{
  expect(getAiConfig(new Headers({'x-vercel-oidc-token':'untrusted'}))).toEqual({available:false});
});
it('retains API key and local OIDC support and validates the model id',()=>{
  vi.stubEnv('VERCEL_OIDC_TOKEN','test-local-token'); expect(getAiConfig()).toMatchObject({available:true});
  vi.stubEnv('VERCEL_OIDC_TOKEN','');vi.stubEnv('AI_GATEWAY_API_KEY','test-key');expect(getAiConfig()).toMatchObject({available:true});
  vi.stubEnv('AI_MODEL','invalid model');expect(getAiConfig()).toEqual({available:false});
});
