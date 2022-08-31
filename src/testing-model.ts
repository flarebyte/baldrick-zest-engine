import { z } from 'zod';
import {
  stringFunctionName,
  stringJsonFilename,
  stringPropPath,
  stringTitle,
  stringTypescriptFilename,
} from './testing-field-validation.js';
const factoryFunction = z.strictObject({
  filename: stringTypescriptFilename,
  functionName: stringFunctionName,
  flags: z
    .array(z.enum(['function', 'new instance']))
    .min(1)
    .default(['function']),
});

const givenJsonFile = z.strictObject({
  a: z.literal('json-file'),
  filename: stringJsonFilename,
  value: stringPropPath.optional(),
  factory: factoryFunction.optional(),
  flags: z
    .array(z.enum(['object', 'array', 'string']))
    .min(1)
    .default(['object']),
});

const givenYamlFile = z.strictObject({
  a: z.literal('yaml-file'),
  filename: stringJsonFilename,
  value: stringPropPath.optional(),
  factory: factoryFunction.optional(),
  flags: z
    .array(z.enum(['object', 'array', 'string']))
    .min(1)
    .default(['object']),
});
const simpleFunctionTestCase = z.object({
  a: z.literal('simple'),
  title: stringTitle,
  param0: z.discriminatedUnion('a', [givenJsonFile, givenYamlFile]),
  param1: z.discriminatedUnion('a', [givenJsonFile, givenYamlFile]).optional(),
  param2: z.discriminatedUnion('a', [givenJsonFile, givenYamlFile]).optional(),
  param3: z.discriminatedUnion('a', [givenJsonFile, givenYamlFile]).optional(),
});

const functionTesting = z.object({
  functionName: stringFunctionName,
  testCases: z.array(simpleFunctionTestCase).min(1).max(30),
});

export const schema = z
  .object({
    filename: stringTypescriptFilename,
    functions: z.array(functionTesting).min(1).max(60),
  })
  .strict();
