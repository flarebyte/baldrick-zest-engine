import { readDataFile } from './testing-io.js';
import type {
  TestingFunctionTestCaseModel,
  TestingModel,
  FunctionParamData,
} from './testing-model.js';

const getParamData = async (functionParamData: FunctionParamData) => {
  if (functionParamData.from === 'string') {
    return functionParamData.value;
  }
  const parser = functionParamData.parser;
  const expect = functionParamData.flags.includes('array')
    ? 'array'
    : 'default';
  const value = await readDataFile(functionParamData.filename, {
    parser,
    expect,
  });
  return value;
};

const runTestCase =
  (testingModel: TestingModel) =>
  async (testCase: TestingFunctionTestCaseModel) => {
    const { filename, functionName } = testingModel;
    if (testCase.a === 'snapshot') {
      const { params, flags } = testCase;
      const { first } = params;
      console.log({ filename, functionName, params, flags });
      const value = await getParamData(first);
      console.log('content>>>', value);
    }
  };

export const runZestFileSuite = async (testingModel: TestingModel) => {
  const { testCases } = testingModel;
  const testCasesAsync = testCases.map(runTestCase(testingModel));
  await Promise.all(testCasesAsync);
};
