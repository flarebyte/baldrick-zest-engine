import YAML from 'yaml';
import { readFile, writeFile } from 'node:fs/promises';
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

const readDataFile = async (
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
  filename: string,
  opts: {
    parser: FileParser;
  }
): Promise<DataFileResult> => {
  try {
    const value = await readDataFile(filename, opts);
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
  filename: string,
  content: object | string,
  opts: {
    parser: FileParser;
  }
): Promise<void> => {
  if (opts.parser === 'JSON' && typeof content !== 'string') {
    const jsonContent = JSON.stringify(content, null, 2);
    await writeFile(filename, jsonContent, {
      encoding: 'utf8',
    });
    return;
  }
  if (opts.parser === 'YAML' && typeof content !== 'string') {
    const yamlContent = YAML.stringify(content);
    await writeFile(filename, yamlContent);
    return;
  }
  if (opts.parser !== 'Text') {
    console.warn(`For a string result, the parser should be Text: ${filename}`);
    return;
  }

  await writeFile(filename, `${content}`, { encoding: 'utf8' });
};
