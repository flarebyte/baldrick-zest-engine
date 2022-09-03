import YAML from 'yaml';
import { readFile } from 'node:fs/promises';
import {
  FileParser,
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

export const readDataFile = async (
  filename: string,
  opts: {
    parser: FileParser;
  }
): Promise<object | string> => {
  const content = await readFile(filename, { encoding: 'utf8' });

  if (opts.parser === 'YAML') {
    const contentObject: object = YAML.parse(content);
    return contentObject;
  }
  if (opts.parser === 'JSON') {
    const contentObject: object = JSON.parse(content);
    return contentObject;
  }

  return content;
};
