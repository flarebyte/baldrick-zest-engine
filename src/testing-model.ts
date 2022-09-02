import { z } from 'zod';
import { formatMessage, ValidationError } from './format-message.js';
import {
  stringClassName,
  stringFunctionName,
  stringJsonFilename,
  stringPropPath,
  stringTitle,
  stringTypescriptFilename,
} from './testing-field-validation.js';
const transformerFunction = z.strictObject({
  filename: stringTypescriptFilename,
  className: stringClassName.optional(),
  functionName: stringFunctionName.optional(),
});

const givenFile = z.strictObject({
  from: z.literal('file'),
  filename: stringJsonFilename,
  parser: z.enum(['json', 'yaml']),

  value: stringPropPath.optional(),
  transform: transformerFunction.optional(),
  flags: z
    .array(z.enum(['object', 'array', 'string']))
    .min(1)
    .default(['object']),
});

const givenString = z.strictObject({
  from: z.literal('string'),
  value: z.string(),
});

const givenArrayFile = z.strictObject({
  filename: stringJsonFilename,
  parser: z.enum(['json', 'yaml']),
  value: stringPropPath.optional(),
  transform: transformerFunction.optional(),
});

const givenData = z.discriminatedUnion('from', [givenFile, givenString]);

const snapshotFunctionTestCase = z.object({
  a: z.literal('snapshot'),
  title: stringTitle,
  params: z.object({
    first: givenData,
    second: givenData.optional(),
    third: givenData.optional(),
  }),

  result: z.object({
    transform: transformerFunction.optional(),
  }),

  flags: z
    .array(z.enum(['json-snapshot', 'yaml-snapshot', 'text-snapshot']))
    .min(1)
    .default(['json-snapshot']),
});

const loopSnapshotFunctionTestCase = z.object({
  a: z.literal('each-snapshot'),
  title: stringTitle,
  givenEach: givenArrayFile,
  result: z.object({
    transform: transformerFunction.optional(),
  }),
  flags: z
    .array(z.enum(['json-snapshot', 'yaml-snapshot', 'text-snapshot']))
    .min(1)
    .default(['json-snapshot']),
});

const functionTesting = z.object({
  functionName: stringFunctionName,
  testCases: z
    .array(
      z.discriminatedUnion('a', [
        snapshotFunctionTestCase,
        loopSnapshotFunctionTestCase,
      ])
    )
    .min(1)
    .max(30),
});

const schema = z
  .object({
    filename: stringTypescriptFilename,
    functions: z.array(functionTesting).min(1).max(60),
  })
  .strict();

export type TestingModel = z.infer<typeof schema>;

export type TestingModelValidation =
  | {
      status: 'valid';
      value: TestingModel;
    }
  | {
      status: 'invalid';
      errors: ValidationError[];
    };

export const safeParseTestingModel = (
  content: unknown
): TestingModelValidation => {
  const result = schema.safeParse(content);
  if (result.success) {
    return { status: 'valid', value: result.data };
  }
  const {
    error: { issues },
  } = result;
  const errors = issues.map(formatMessage);
  return {
    status: 'invalid',
    errors,
  };
};
