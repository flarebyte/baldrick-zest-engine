import YAML from 'yaml';
import jetpack from 'fs-jetpack';
import { readFile } from 'node:fs/promises';
import {
  safeParseTestingModel,
  TestingModelValidation,
} from './testing-model.js';

export const getZestYaml = async (
  filename: string
): Promise<TestingModelValidation> => {
  const content = await readFile(filename, { encoding: 'utf8' });
  const contentObject = YAML.parse(content);
  return safeParseTestingModel(contentObject);
};

export const findZestFiles = async (parentDir: string): Promise<string[]> => {
  return await jetpack.findAsync(parentDir, { matching: '**/*.zest.yaml' });
};
