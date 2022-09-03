import { readDataFile } from './testing-io.js';
import type {
  TestingFunctionTestCaseModel,
  TestingModel,
  FunctionParamData,
  AnyFunctionModel,
} from './testing-model.js';

const getParamData = async (functionParamData: FunctionParamData) => {
  if (functionParamData.from === 'string') {
    return functionParamData.value;
  }
  const parser = functionParamData.parser;

  const value = await readDataFile(functionParamData.filename, {
    parser,
  });
  return value;
};

interface TestCaseExecutionContext {
  testing: AnyFunctionModel;

  params: {
    first: object | string;
    second?: object | string;
    third?: object | string;
  };
}

const runTestCase =
  (testingModel: TestingModel) =>
  async (testCase: TestingFunctionTestCaseModel) => {
    if (testCase.a === 'snapshot') {
      const { params, flags } = testCase;
      const { first } = params;
      console.log({ testingModel, params, flags });
      const testCaseExecutionContext: TestCaseExecutionContext = {
        testing: testingModel.testing,
        params: {
          first: await getParamData(first),
        },
      };
      console.log('content>>>', testCaseExecutionContext);
    }
  };

export const runZestFileSuite = async (testingModel: TestingModel) => {
  const { cases } = testingModel;
  const testCasesAsync = cases.map(runTestCase(testingModel));
  await Promise.all(testCasesAsync);
};
