
import { VapiCallLog } from '@/components/call-center/call-logs/types';
import { CallRecord } from '@/components/call-center/types';

export type { VapiCallLog, CallRecord };

export type CallFormattingOptions = {
  includeSeconds?: boolean;
  use24Hour?: boolean;
};

export type CallDisplayConfig = {
  showTranscript?: boolean;
  showDuration?: boolean;
  showStatus?: boolean;
  showDirection?: boolean;
  showAudio?: boolean;
};
