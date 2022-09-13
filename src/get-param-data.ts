import { readDataFileSafely } from './testing-io.js';
import { FunctionParamData } from './testing-model.js';

type ParamDataResult =
  | {
      status: 'success';
      value: object | string;
    }
  | {
      status: 'failure';
      message: string;
    };

export const getParamData = async (
  functionParamData: FunctionParamData
): Promise<ParamDataResult> => {
  
  if (functionParamData.from === 'string') {
    return { status: 'success', value: functionParamData.value };
  }
  const parser = functionParamData.parser;

  const loadedValue = await readDataFileSafely(functionParamData.filename, {
    parser,
  });
  if (loadedValue.status === 'success') {
    return { status: 'success', value: loadedValue.value };
  } else {
    return { status: 'failure', message: loadedValue.message };
  }
};
