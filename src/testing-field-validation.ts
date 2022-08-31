import { z } from 'zod';

const isSingleLine = (value: string) => value.split(/[\n\r]/).length <= 1;

export const stringTitle = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .refine(isSingleLine, { message: 'title should be a single line' });
export const stringTypescriptFilename = z
  .string()
  .trim()
  .min(1)
  .max(300)
  .endsWith('ts');

  export const stringJsonFilename = z
  .string()
  .trim()
  .min(1)
  .max(300)
  .endsWith('.json');

  export const stringFunctionName = z
  .string()
  .min(1)
  .max(50)
  .regex(/[a-z][\d_a-z]+/);

  export const stringPropPath = z
  .string()
  .min(1)
  .max(300)
  .regex(/(([\d._a-z]+)|(\[\d+]))+/);