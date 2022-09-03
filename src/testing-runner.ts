import { readDataFile } from './testing-io.js';
import type {
  TestingFunctionTestCaseModel,
  TestingFunctionModel,
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
  (testingModel: TestingModel, testingFunctionModel: TestingFunctionModel) =>
  async (testCase: TestingFunctionTestCaseModel) => {
    const { filename } = testingModel;
    const { functionName } = testingFunctionModel;
    if (testCase.a === 'snapshot') {
      const { params, flags } = testCase;
      const { first } = params;
      console.log({ filename, functionName, params, flags });
      const value = await getParamData(first);
      console.log('content>>>', value);
    }
  };
const runAllFunctionCases =
  (testingModel: TestingModel) =>
  async (testingFunctionModel: TestingFunctionModel) => {
    const { testCases } = testingFunctionModel;
    const testCasesAsync = testCases.map(
      runTestCase(testingModel, testingFunctionModel)
    );
    await Promise.all(testCasesAsync);
  };

export const runZestFileSuite = async (testingModel: TestingModel) => {
  const { functions } = testingModel;
  const functionsAsync = functions.map(runAllFunctionCases(testingModel));
  await Promise.all(functionsAsync);
};
