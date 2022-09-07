import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
export const mkdirForFile = async (filename: string) => {
  await mkdir(dirname(filename), { recursive: true });
};
