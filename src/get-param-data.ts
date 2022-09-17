import { readDataFileSafely } from './testing-io.js';
import { FunctionParamData } from './testing-model.js';
import { createTransformerFunctions } from './transformer-executor.js';

function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) return error.stack;
  return undefined;
}

type ParamDataResult =
  | {
      status: 'success';
      value: object | string;
    }
  | {
      status: 'failure';
      message: string;
      stack?: string;
    };

export const getParamData = async (
  functionParamData: FunctionParamData
): Promise<ParamDataResult> => {
  const transformerHolder = await createTransformerFunctions(
    functionParamData.transform === undefined ? [] : functionParamData.transform
  );

  if (transformerHolder.status === 'failure') {
    return { status: 'failure', message: transformerHolder.message };
  }

  const transformer = transformerHolder.func;

  if (functionParamData.from === 'string') {
    try {
      const value = transformer(functionParamData.value);
      return { status: 'success', value };
    } catch (error) {
      return {
        status: 'failure',
        message: 'Transformation of string data failed',
        stack: getErrorStack(error),
      };
    }
  }
  const parser = functionParamData.parser;

  const loadedValue = await readDataFileSafely(functionParamData.filename, {
    parser,
  });
  if (loadedValue.status === 'success') {
    try {
      const value = transformer(loadedValue.value);
      return { status: 'success', value };
    } catch (error) {
      return {
        status: 'failure',
        message: 'Transformation of data file failed',
        stack: getErrorStack(error),
      };
    }
  } else {
    return { status: 'failure', message: loadedValue.message};
  }
};
