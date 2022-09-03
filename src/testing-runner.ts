import { executeCase } from './case-executor.js';
import { logTestCaseResult } from './case-logger.js';
import { TestCaseExecutionContext } from './execution-context-model.js';
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

  const value = await readDataFile(functionParamData.filename, {
    parser,
  });
  return value;
};

const runTestCase =
  (testingModel: TestingModel) =>
  async (testCase: TestingFunctionTestCaseModel) => {
    if (testCase.a === 'snapshot') {
      const { params, flags } = testCase;
      const { first } = params;
      console.log({ testingModel, params, flags });
      const testCaseExecutionContext: TestCaseExecutionContext = {
        testing: testingModel.testing,
        title: testCase.title,
        params: {
          first: await getParamData(first),
        },
      };
      const executed = await executeCase(testCaseExecutionContext);
      logTestCaseResult(executed);
    }
  };

export const runZestFileSuite = async (testingModel: TestingModel) => {
  const { cases } = testingModel;
  const testCasesAsync = cases.map(runTestCase(testingModel));
  await Promise.all(testCasesAsync);
};
