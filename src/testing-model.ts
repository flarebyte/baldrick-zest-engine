import { array, z } from 'zod';
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
  stringValue,
  stringParserKey,
} from './testing-field-validation.js';
import { Result, zestFail, zestOk } from './zest-railway.js';

const pureFunctionAbc = z
  .strictObject({
    style: z.literal('function a b c'),
    import: stringImport,
    function: stringFunctionName,
  })
  .describe('A function with 3 arguments');

const pureFunctionAb = z
  .strictObject({
    style: z.literal('function a b'),
    import: stringImport,
    function: stringFunctionName,
  })
  .describe('A function with 2 arguments');

const pureFunctionA = z
  .strictObject({
    style: z.literal('function a'),
    import: stringImport,
    function: stringFunctionName,
  })
  .describe('A function with a single argument');

const highOrderFunction = z
  .strictObject({
    style: z.literal('config -> function a'),
    import: stringImport,
    function: stringFunctionName,
    config: z
      .record(stringCustomKey, stringValue)
      .describe('A configuration made of keys and values'),
  })
  .describe('A higher order function that accepts configuration');

const staticMethodA = z.strictObject({
  style: z.literal('Class.method a'),
  import: stringImport,
  class: stringClassName,
  function: stringFunctionName,
});

const anyFunctionTransf = z
  .discriminatedUnion('style', [
    pureFunctionA,
    staticMethodA,
    highOrderFunction,
  ])
  .describe('A choice of function');

const highTumbleFunction = z
  .strictObject({
    style: z.literal('config + table -> function'),
    import: stringImport,
    function: stringFunctionName,
    config: z
      .record(stringCustomKey, stringValue)
      .describe('A configuration made of keys and values'),
    table: array(z.record(stringCustomKey, stringValue))
      .min(1)
      .max(300)
      .describe('A table with rows of values'),
  })
  .describe('A function that accepts configuration used for tumbling the code');

const anyUnderTestingFunction = z
  .discriminatedUnion('style', [
    pureFunctionAbc,
    pureFunctionAb,
    pureFunctionA,
    staticMethodA,
  ])
  .describe('Choice of function that is been tested');
const transformers = z
  .array(anyFunctionTransf)
  .min(1)
  .max(5)
  .describe('A list of transformers in order');

const givenFile = z
  .strictObject({
    from: z.literal('file'),
    filename: stringFilename,
    parser: stringParserKey.default('Text'),
    transform: transformers.optional(),
  })
  .describe('A fixture from a file');

const givenString = z
  .strictObject({
    from: z.literal('string'),
    value: z
      .string()
      .describe('A string value that can be used by the function'),
    transform: transformers.optional(),
  })
  .describe('An input as a string');

const givenData = z.discriminatedUnion('from', [givenFile, givenString]);

const commonFunctionTestCase = {
  skip: stringSkipReason.optional(),
  name: stringRuntimeOnly,
  title: stringTitle.describe('The title of the test use case'),
  result: z
    .object({
      transform: transformers,
    })
    .optional()
    .describe('Add transformations on the result'),

  snapshot: stringParserKey.default('YAML'),
  tumble: highTumbleFunction.optional(),
};

const snapshotFunctionTestCase = z
  .object({
    a: z.literal('snapshot'),
    ...commonFunctionTestCase,
    params: z
      .array(givenData)
      .min(1)
      .max(3)
      .describe('A list of parameters expected by the function'),
  })
  .describe('A test use case that will save the result as a snapshot');

const todoTestCase = z
  .object({
    a: z.literal('todo'),
    name: stringRuntimeOnly,
    title: stringTitle.describe('A title for the TODO case'),
  })
  .describe('The description for a future TODO test');

const functionTestCase = z
  .discriminatedUnion('a', [snapshotFunctionTestCase, todoTestCase])
  .describe('A choice of test use case');

const schema = z
  .object({
    testing: anyUnderTestingFunction,
    cases: z.record(stringCustomKey, functionTestCase),
  })
  .strict()
  .describe('A list of tests for a given function');

/** Types */

export type TestingModel = z.infer<typeof schema>;

export type AnyTestedFunctionModel = z.infer<typeof anyUnderTestingFunction>;

export type TestingFunctionTestCaseModel = z.infer<typeof functionTestCase>;

export type TestingFunctionSnapshotTestCaseModel = z.infer<
  typeof snapshotFunctionTestCase
>;

export type TestingTodoTestCaseModel = z.infer<typeof todoTestCase>;

export type FunctionParamData = z.infer<typeof givenData>;

export type AnyTransformerModel = z.infer<typeof anyFunctionTransf>;

export type AnyTumbleFunctionModel = z.infer<typeof highTumbleFunction>;

export type TestingModelValidation = Result<TestingModel, ValidationError[]>;

export const safeParseTestingModel = (
  content: unknown
): TestingModelValidation => {
  const result = schema.safeParse(content);
  if (result.success) {
    return zestOk(result.data);
  }
  const {
    error: { issues },
  } = result;
  const errors = issues.map(formatMessage);
  return zestFail(errors);
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getSchema = (_name: 'default') => {
  return schema;
};
