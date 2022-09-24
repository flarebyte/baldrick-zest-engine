import { readDataFileSafely } from './testing-io.js';
import { FunctionParamData } from './testing-model.js';
import { createTransformerFunctions } from './transformer-executor.js';
import { ExternalInjection } from './run-opts-model.js';
import { Result } from './zest-railway.js';

function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) return error.stack;
  return undefined;
}

type ParamDataResult = Result<
  object | string,
  { message: string; stack?: string }
>;

export const getParamData = async (
  injection: ExternalInjection,
  functionParamData: FunctionParamData
): Promise<ParamDataResult> => {
  const transformerHolder = await createTransformerFunctions(
    injection,
    functionParamData.transform === undefined ? [] : functionParamData.transform
  );

  if (transformerHolder.status === 'failure') {
    return { status: 'failure', error: { message: transformerHolder.message } };
  }

  const transformer = transformerHolder.func;

  if (functionParamData.from === 'string') {
    try {
      const value = transformer(functionParamData.value);
      return { status: 'success', value };
    } catch (error) {
      return {
        status: 'failure',
        error: {
          message: 'Transformation of string data failed',
          stack: getErrorStack(error),
        },
      };
    }
  }
  const parser = functionParamData.parser;
  if (!injection.io.parsers.includes(parser)) {
    return {
      status: 'failure',
      error: {
        message: `Parser "${parser}" is not supported`,
      },
    };
  }

  const loadedValue = await readDataFileSafely(
    injection,
    functionParamData.filename,
    {
      parser,
    }
  );
  if (loadedValue.status === 'success') {
    try {
      const value = transformer(loadedValue.value);
      return { status: 'success', value };
    } catch (error) {
      return {
        status: 'failure',
        error: {
          message: 'Transformation of data file failed',
          stack: getErrorStack(error),
        },
      };
    }
  } else {
    return { status: 'failure', error: { message: loadedValue.message } };
  }
};
