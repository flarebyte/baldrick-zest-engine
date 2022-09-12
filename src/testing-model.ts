import { z } from 'zod';
import { formatMessage, ValidationError } from './format-message.js';
import {
  stringClassName,
  stringFunctionName,
  stringFilename,
  stringTitle,
  stringImport,
  stringCustomKey,
  stringRuntimeOnly,
  stringSkipReason,
} from './testing-field-validation.js';

const pureFunctionAbc = z.strictObject({
  style: z.literal('function a b c'),
  import: stringImport,
  function: stringFunctionName,
});

const pureFunctionAb = z.strictObject({
  style: z.literal('function a b'),
  import: stringImport,
  function: stringFunctionName,
});

const pureFunctionA = z.strictObject({
  style: z.literal('function a'),
  import: stringImport,
  function: stringFunctionName,
});

// const highOrderFunction = z.strictObject({
//   style: z.literal('string -> function a'),
//   import: stringImport,
//   function: stringFunctionName,
//   value: stringValue,
// });

const staticMethodA = z.strictObject({
  style: z.literal('Class.method a'),
  import: stringImport,
  class: stringClassName,
  function: stringFunctionName,
});

const anyFunctionTransf = z.discriminatedUnion('style', [
  pureFunctionA,
  staticMethodA
]);

const anyUnderTestingFunction = z.discriminatedUnion('style', [
  pureFunctionAbc,
  pureFunctionAb,
  pureFunctionA,
  staticMethodA,
]);
const transformers = z.array(anyFunctionTransf).min(1).max(7);

const fileParser = z.enum(['Text', 'JSON', 'YAML']);
const givenFile = z.strictObject({
  from: z.literal('file'),
  filename: stringFilename,
  parser: fileParser.default('Text'),
  transform: transformers.optional(),
});

const givenString = z.strictObject({
  from: z.literal('string'),
  value: z.string(),
  transform: transformers.optional(),
});

const givenData = z.discriminatedUnion('from', [givenFile, givenString]);
const snapshotType = z.enum(['Text', 'JSON', 'YAML']);
const parameterId = z.enum(['first', 'second', 'third']);

const commonFunctionTestCase = {
  skip: stringSkipReason.optional(),
  name: stringRuntimeOnly,
  title: stringTitle,
  result: z
    .object({
      transform: transformers,
    })
    .optional(),

  snapshot: snapshotType,
};

const snapshotFunctionTestCase = z.object({
  a: z.literal('snapshot'),
  ...commonFunctionTestCase,
  params: z.array(givenData).min(1).max(3),
  loopOnParam: parameterId.optional(),
});

const todoTestCase = z.object({
  a: z.literal('todo'),
  name: stringRuntimeOnly,
  title: stringTitle,
});

const functionTestCase = z.discriminatedUnion('a', [
  snapshotFunctionTestCase,
  todoTestCase,
]);

const schema = z
  .object({
    testing: anyUnderTestingFunction,
    cases: z.record(stringCustomKey, functionTestCase),
    flags: stringRuntimeOnly,
    specFile: stringRuntimeOnly,
    specDir: stringRuntimeOnly,
    snapshotDir: stringRuntimeOnly,
  })
  .strict();

/** Types */

export type TestingModel = z.infer<typeof schema>;

export type AnyTestedFunctionModel = z.infer<typeof anyUnderTestingFunction>;

export type TestingFunctionTestCaseModel = z.infer<typeof functionTestCase>;

export type TestingFunctionSnapshotTestCaseModel = z.infer<
  typeof snapshotFunctionTestCase
>;

export type TestingTodoTestCaseModel = z.infer<typeof todoTestCase>;

export type FunctionParamData = z.infer<typeof givenData>;

export type FileParser = z.infer<typeof fileParser>;

export type AnyTransformerModel = z.infer<typeof anyFunctionTransf>

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
