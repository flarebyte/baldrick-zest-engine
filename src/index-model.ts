import { z } from 'zod';
import { stringDirectory } from './testing-field-validation.js';
const schema = z
  .object({
    sourceDirectory: stringDirectory,
    specDirectory: stringDirectory,
  })
  .strict();

  export type TestingRunOpts = z.infer<typeof schema>;