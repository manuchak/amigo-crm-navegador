
/**
 * Deprecated: All functions now use shared utilities/components from @/components/shared/call-logs.
 * Existing functions will throw or pass-through to the shared utility.
 * 
 * Remove this file in future if fully migrated.
 */
import { formatCallDateTime, formatCallDuration, formatPhoneNumber, getBestPhoneNumber } from '@/components/shared/call-logs/utils';
import { CallStatusBadge } from '@/components/shared/call-logs/CallStatusBadge';
import { VapiCallLog } from '../../types';
import React from 'react';

// Compatibility re-exports
export const formatDateTime = formatCallDateTime;
export const formatDuration = formatCallDuration;
export const getStatusBadge = (status: string | null) => <CallStatusBadge status={status} />;
export { formatPhoneNumber, getBestPhoneNumber };
