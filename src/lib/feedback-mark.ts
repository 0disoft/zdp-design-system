import type { ZdpToastTone } from './toast.js';

export const feedbackMarkPath: Record<ZdpToastTone, string> = {
  neutral: 'M8 12h8',
  info: 'M12 11v5m0-8h.01',
  success: 'm8 12 2.5 2.5L16 9',
  warning: 'M12 8v5m0 3h.01',
  danger: 'm9 9 6 6m0-6-6 6'
};
