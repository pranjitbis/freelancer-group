import { initSocketIO } from './route';

// This should be called from your main server file
export function setupSocketIO(server) {
  return initSocketIO(server);
}