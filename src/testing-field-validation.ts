import { z } from 'zod';

const isSingleLine = (value: string) => value.split(/[\n\r]/).length <= 1;

export const stringTitle = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .refine(isSingleLine, { message: 'title should be a single line' });

export const stringSkipReason = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .refine(isSingleLine, {
    message: 'reason for skipping should be a single line',
  })
  .describe('Reason why the tests are been skipped');

export const stringImport = z
  .string()
  .trim()
  .min(1)
  .max(300)
  .describe('A javascript import statement');

export const stringFilename = z
  .string()
  .trim()
  .min(1)
  .max(300)
  .describe('A relative path to a filename');

export const stringFunctionName = z
  .string()
  .min(1)
  .max(50)
  .regex(/[a-z][\d_a-zA-Z]+/)
  .describe('A function name');

export const stringClassName = z
  .string()
  .min(1)
  .max(50)
  .regex(/[A-Z][\d_a-z]+/).describe('A class name');

export const stringCustomKey = z
  .string()
  .min(1)
  .max(30)
  .regex(/[A-Za-z][a-zA-Z\d_]+/);

export const stringParserKey = z
  .string()
  .min(1)
  .max(30)
  .regex(/\w+/)
  .describe('The parsing format such as JSON or YAML');

export const stringRuntimeOnly = z.string().max(0).default('');

export const stringValue = z.string().trim().min(1).max(300);

// Let's make testing easier

export const safeParseField = (
  name: 'title' | 'filename' | string,
  content: unknown
) => {
  if (name === 'title') {
    return stringTitle.safeParse(content);
  }
  if (name === 'filename') {
    return stringFilename.safeParse(content);
  }
  return `${name} is not supported`;
};
