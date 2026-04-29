import type { ApiCheck, CheckResult, CheckStatus } from '../types';

function makeResult(
  check: ApiCheck,
  status: CheckStatus,
  detail: string,
  start: number,
  permissionState: PermissionState | null = null,
): CheckResult {
  return {
    id: check.id,
    name: check.name,
    category: check.category,
    weight: check.weight,
    status,
    detail,
    duration_ms: Math.round(performance.now() - start),
    stage: check.stage,
    permission_state: permissionState,
    mdn_url: check.mdn_url,
    known_support: check.known_support,
  };
}

export const credentialManagementCheck: ApiCheck = {
  id: 'credential-management',
  name: 'Credential Management',
  category: 'identity_auth',
  description: 'Store and retrieve credentials (passwords, federated identities).',
  weight: 3,
  stage: 1,
  known_support: { blink: true, webkit: 'partial', gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Credential_Management_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('credentials' in navigator)) {
      return makeResult(
        credentialManagementCheck,
        'not_supported',
        'Credential Management API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        credentialManagementCheck,
        'https_required',
        'Credential Management requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(
      credentialManagementCheck,
      'supported',
      'Credential Management API is available.',
      start,
    );
  },
};

export const webAuthnCheck: ApiCheck = {
  id: 'webauthn',
  name: 'WebAuthn',
  category: 'identity_auth',
  description: 'Passwordless authentication using hardware keys or biometrics.',
  weight: 4,
  stage: 1,
  known_support: { blink: true, webkit: true, gecko: true },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('PublicKeyCredential' in window)) {
      return makeResult(
        webAuthnCheck,
        'not_supported',
        'WebAuthn (PublicKeyCredential) is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        webAuthnCheck,
        'https_required',
        'WebAuthn requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(webAuthnCheck, 'supported', 'WebAuthn API is available.', start);
  },
};

export const fedCmCheck: ApiCheck = {
  id: 'fedcm',
  name: 'FedCM (Federated Credential Management)',
  category: 'identity_auth',
  description: 'Privacy-preserving federated identity without third-party cookies.',
  weight: 3,
  stage: 1,
  known_support: { blink: true, webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/FedCM_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('IdentityCredential' in window)) {
      return makeResult(
        fedCmCheck,
        'not_supported',
        'FedCM (IdentityCredential) is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        fedCmCheck,
        'https_required',
        'FedCM requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(fedCmCheck, 'supported', 'FedCM API is available.', start);
  },
};

export const digitalCredentialCheck: ApiCheck = {
  id: 'digital-credential',
  name: 'Digital Credential API',
  category: 'identity_auth',
  description: 'Request and present digital identity credentials (mDL, VC).',
  weight: 2,
  stage: 1,
  known_support: { blink: 'partial', webkit: false, gecko: false },
  mdn_url: 'https://developer.mozilla.org/en-US/docs/Web/API/Digital_Credentials_API',
  run: async (): Promise<CheckResult> => {
    const start = performance.now();
    if (!('DigitalCredential' in window)) {
      return makeResult(
        digitalCredentialCheck,
        'not_supported',
        'Digital Credential API is not available in this browser.',
        start,
      );
    }
    if (!window.isSecureContext) {
      return makeResult(
        digitalCredentialCheck,
        'https_required',
        'Digital Credential API requires a secure context (HTTPS).',
        start,
      );
    }
    return makeResult(
      digitalCredentialCheck,
      'supported',
      'Digital Credential API is available.',
      start,
    );
  },
};

export const identityAuthChecks: ApiCheck[] = [
  credentialManagementCheck,
  webAuthnCheck,
  fedCmCheck,
  digitalCredentialCheck,
];
