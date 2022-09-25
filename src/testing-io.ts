import {
  safeParseTestingModel,
  TestingModelValidation,
} from './testing-model.js';
import { ExternalInjection } from './run-opts-model.js';
import { Result, zestFail, zestOk } from './zest-railway.js';

export const getZestYaml = async (
  injection: ExternalInjection,
  filename: string
): Promise<TestingModelValidation> => {
  const content = await injection.io.readContent(filename, { parser: 'YAML' });
  return safeParseTestingModel(content);
};

const readDataFile = async (
  injection: ExternalInjection,
  filename: string,
  opts: {
    parser: string;
  }
): Promise<object | string> =>
  await injection.io.readContent(filename, { parser: opts.parser });

type DataFileResult = Result<
  object | string,
  {
    filename: string;
    opts: {
      parser: string;
    };
    message: string;
  }
>;

export const readDataFileSafely = async (
  injection: ExternalInjection,
  filename: string,
  opts: {
    parser: string;
  }
): Promise<DataFileResult> => {
  try {
    const value = await readDataFile(injection, filename, opts);
    return zestOk(value);
  } catch (error) {
    if (error instanceof Error) {
      return zestFail({
        filename,
        opts,
        message: error.message,
      });
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
    parser: string;
  }
): Promise<void> =>
  await injection.io.writeContent(filename, content, { parser: opts.parser });
