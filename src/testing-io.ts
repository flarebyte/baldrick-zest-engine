import YAML from 'yaml';
import { readFile } from 'node:fs/promises';
import {
  FileParser,
  safeParseTestingModel,
  TestingModelValidation,
} from './testing-model.js';
import { JsonArray, JsonObject } from 'type-fest';

export const getZestYaml = async (
  filename: string
): Promise<TestingModelValidation> => {
  const content = await readFile(filename, { encoding: 'utf8' });
  const contentObject = YAML.parse(content);
  return safeParseTestingModel(contentObject);
};

// TODO: Pick up parser as config
export const readDataFile = async (
  filename: string,
  opts: {
    parser: FileParser;
    expect: 'default' | 'array';
  }
): Promise<JsonObject | JsonArray | string | string[]> => {
  const content = await readFile(filename, { encoding: 'utf8' });
  if (opts.parser === 'Text' && opts.expect === 'array') {
    return content.split('\n');
  }
  if (opts.parser === 'YAML' && opts.expect === 'array') {
    const contentArray: JsonArray = YAML.parse(content);
    return contentArray;
  }
  if (opts.parser === 'YAML' && opts.expect === 'default') {
    const contentObject: JsonObject = YAML.parse(content);
    return contentObject;
  }
  if (opts.parser === 'JSON' && opts.expect === 'array') {
    const contentArray: JsonArray = JSON.parse(content);
    return contentArray;
  }
  if (opts.parser === 'JSON' && opts.expect === 'default') {
    const contentObject: JsonObject = JSON.parse(content);
    return contentObject;
  }

  return content;
};
