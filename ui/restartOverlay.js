import { createOverlay } from './overlay.js';

export function showRestartScreen(message = 'Game Over') {
  return createOverlay('restart-overlay', message);
}
