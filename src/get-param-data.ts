import { readDataFileSafely } from './testing-io.js';
import { FunctionParamData } from './testing-model.js';


export const getParamData = async (functionParamData: FunctionParamData) => {
  if (functionParamData.from === 'string') {
    return functionParamData.value;
  }
  const parser = functionParamData.parser;

  const value = await readDataFileSafely(functionParamData.filename, {
    parser,
  });
  return value;
};
