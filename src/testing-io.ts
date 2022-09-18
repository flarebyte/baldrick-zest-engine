import YAML from 'yaml';
// import { readFile, writeFile } from 'node:fs/promises';
import {
  FileParser,
  safeParseTestingModel,
  TestingModelValidation,
} from './testing-model.js';
import { ExternalInjection } from './run-opts-model.js';

export const getZestYaml = async (
  injection: ExternalInjection,
  filename: string
): Promise<TestingModelValidation> => {
  const content = await injection.fs.readStringFile(filename);
  const contentObject = YAML.parse(content);
  return safeParseTestingModel(contentObject);
};

const readDataFile = async (
  injection: ExternalInjection,
  filename: string,
  opts: {
    parser: FileParser;
  }
): Promise<object | string> => {
  const content = await injection.fs.readStringFile(filename);

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

type DataFileResult =
  | {
      filename: string;
      status: 'success';
      value: object | string;
    }
  | {
      filename: string;
      opts: {
        parser: FileParser;
      };
      status: 'failure';
      message: string;
    };

export const readDataFileSafely = async (
  injection: ExternalInjection,
  filename: string,
  opts: {
    parser: FileParser;
  }
): Promise<DataFileResult> => {
  try {
    const value = await readDataFile(injection, filename, opts);
    return {
      status: 'success',
      filename,
      value,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        status: 'failure',
        filename,
        opts,
        message: error.message,
      };
    } else {
      throw error;
    }
  }
};

export const writeSnapshotFile = async (
  injection: ExternalInjection,
  filename: string,
  content: object | string,
  opts: {
    parser: FileParser;
  }
): Promise<void> => {
  if (opts.parser === 'JSON' && typeof content !== 'string') {
    const jsonContent = JSON.stringify(content, null, 2);
    await injection.fs.writeStringFile(filename, jsonContent);
    return;
  }
  if (opts.parser === 'YAML' && typeof content !== 'string') {
    const yamlContent = YAML.stringify(content);
    await injection.fs.writeStringFile(filename, yamlContent);
    return;
  }
  if (opts.parser !== 'Text') {
    console.warn(`For a string result, the parser should be Text: ${filename}`);
    return;
  }

  await injection.fs.writeStringFile(filename, `${content}`);
};
