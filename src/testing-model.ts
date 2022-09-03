import { z } from 'zod';
import { formatMessage, ValidationError } from './format-message.js';
import {
  stringClassName,
  stringFunctionName,
  stringFilename,
  stringPropPath,
  stringTitle,
  stringImport,
} from './testing-field-validation.js';

const pureFunction = z.strictObject({
  a: z.literal('pure-function'),
  import: stringImport,
  function: stringFunctionName,
});

const staticMethod = z.strictObject({
  a: z.literal('static-method'),
  import: stringImport,
  class: stringClassName,
  function: stringFunctionName,
});

const anyFunction = z.discriminatedUnion('a', [pureFunction, staticMethod]);

const fileParser = z.enum(['Text', 'JSON', 'YAML']);
const givenFile = z.strictObject({
  from: z.literal('file'),
  filename: stringFilename,
  parser: fileParser.default('Text'),

  value: stringPropPath.optional(),
  transform: anyFunction.optional(),
});

const givenString = z.strictObject({
  from: z.literal('string'),
  value: z.string(),
});

const givenArrayFile = z.strictObject({
  filename: stringFilename,
  parser: fileParser.default('Text'),
  value: stringPropPath.optional(),
  transform: anyFunction.optional(),
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

  result: z
    .object({
      transform: anyFunction,
    })
    .optional(),

  flags: z
    .array(z.enum(['json-snapshot', 'yaml-snapshot', 'text-snapshot']))
    .min(1)
    .default(['json-snapshot']),
});

const loopSnapshotFunctionTestCase = z.object({
  a: z.literal('each-snapshot'),
  title: stringTitle,
  givenEach: givenArrayFile,
  result: z
    .object({
      transform: anyFunction,
    })
    .optional(),
  flags: z
    .array(z.enum(['json-snapshot', 'yaml-snapshot', 'text-snapshot']))
    .min(1)
    .default(['json-snapshot']),
});

const functionTestCase = z.discriminatedUnion('a', [
  snapshotFunctionTestCase,
  loopSnapshotFunctionTestCase,
]);

const schema = z
  .object({
    testing: anyFunction,
    cases: z.array(functionTestCase).min(1).max(30),
  })
  .strict();

/** Types */

export type TestingModel = z.infer<typeof schema>;

export type TestingFunctionTestCaseModel = z.infer<typeof functionTestCase>;

export type FunctionParamData = z.infer<typeof givenData>;

export type FileParser = z.infer<typeof fileParser>;

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
