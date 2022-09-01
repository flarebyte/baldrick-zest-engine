import { z } from 'zod';
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

export const schema = z
  .object({
    filename: stringTypescriptFilename,
    functions: z.array(functionTesting).min(1).max(60),
  })
  .strict();

export type TestingModel = z.infer<typeof schema>;

interface ValidationError {
  message: string;
  path: string;
}

export type TestingModelValidation =
  | {
      status: 'valid';
      value: TestingModel;
    }
  | {
      status: 'invalid';
      errors: ValidationError[];
    };

const formatMessage = (issue: z.ZodIssue): ValidationError => {
  const path = issue.path.join('.');
  switch (issue.code) {
    case 'invalid_type':
      return {
        path,
        message: [
          'The type for the field is invalid',
          `I would expect ${issue.expected} instead of ${issue.received}`,
        ].join('; '),
      };
    case 'invalid_string':
      return {
        path,
        message: [
          'The string for the field is invalid',
          `${issue.message} and ${issue.validation}`,
        ].join('; '),
      };

    case 'invalid_enum_value':
      return {
        path,
        message: [
          'The enum for the field is invalid',
          `I would expect any of ${issue.options} instead of ${issue.received}`,
        ].join('; '),
      };

    case 'invalid_literal':
      return {
        path,
        message: [
          'The literal for the field is invalid',
          `I would expect ${issue.expected}`,
        ].join('; '),
      };

    case 'invalid_union_discriminator':
      return {
        path,
        message: [
          'The union discriminator for the object is invalid',
          `I would expect any of ${issue.options}`,
        ].join('; '),
      };
    case 'invalid_union':
      return {
        path,
        message: [
          'The union for the field is invalid',
          `I would check ${issue.unionErrors
            .flatMap((err) => err.issues)
            .map((i) => i.message)}`,
        ].join('; '),
      };
    case 'too_big':
      return {
        path,
        message: [
          `The ${issue.type} for the field is too big`,
          `I would expect the maximum to be ${issue.maximum}`,
        ].join('; '),
      };

    case 'too_small':
      return {
        path,
        message: [
          `The ${issue.type} for the field is too small`,
          `I would expect the minimum to be ${issue.minimum}`,
        ].join('; '),
      };

    default:
      return {
        path,
        message: [
          'The type for the field is incorrect',
          `${issue.message}`,
        ].join('; '),
      };
  }
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
