import type { ApiCheck } from '../types';
import { installabilityChecks } from './installability';
import { serviceWorkerChecks } from './service-worker';
import { storageChecks } from './storage';
import { pushNotificationChecks } from './push-notifications';
import { deviceHardwareChecks } from './device-hardware';
import { fileClipboardChecks } from './file-clipboard';
import { identityAuthChecks } from './identity-auth';
import { mediaCaptureChecks } from './media-capture';
import { sensorsMotionChecks } from './sensors-motion';
import { networkPerformanceChecks } from './network-performance';
import { windowingUiChecks } from './windowing-ui';
import { speechAiChecks } from './speech-ai';
import { paymentsContactsChecks } from './payments-contacts';
import { secureContextChecks } from './secure-context';

export const CHECK_REGISTRY: ApiCheck[] = [
  ...secureContextChecks,
  ...installabilityChecks,
  ...serviceWorkerChecks,
  ...storageChecks,
  ...pushNotificationChecks,
  ...deviceHardwareChecks,
  ...fileClipboardChecks,
  ...identityAuthChecks,
  ...mediaCaptureChecks,
  ...sensorsMotionChecks,
  ...networkPerformanceChecks,
  ...windowingUiChecks,
  ...speechAiChecks,
  ...paymentsContactsChecks,
];
