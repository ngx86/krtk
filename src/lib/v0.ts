import { createV0Client } from '@v0/client';

export const v0 = createV0Client({
  token: import.meta.env.VITE_V0_TOKEN,
}); 