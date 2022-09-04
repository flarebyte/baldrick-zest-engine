import { executeCase } from './case-executor.js';
import {
  logTestCasePreparationIssue,
  logTestCaseResult,
} from './case-logger.js';
import { TestCaseExecutionContext } from './execution-context-model.js';
import { readDataFileSafely } from './testing-io.js';
import type {
  TestingFunctionTestCaseModel,
  TestingModel,
  FunctionParamData,
  TestingFunctionSnapshotTestCaseModel,
} from './testing-model.js';

const getParamData = async (functionParamData: FunctionParamData) => {
  if (functionParamData.from === 'string') {
    return functionParamData.value;
  }
  const parser = functionParamData.parser;

  const value = await readDataFileSafely(functionParamData.filename, {
    parser,
  });
  return value;
};

const runTestCase =
  (testingModel: TestingModel) =>
  async (testCase: TestingFunctionTestCaseModel) => {
    if (testCase.a === 'snapshot') {
      const testCaseExecutionContext = await setupExecutionContext(
        testCase,
        testingModel
      );
      if (!testCaseExecutionContext) {
        return;
      }
      const executed = await executeCase(testCaseExecutionContext);
      logTestCaseResult(executed);
    }
  };

export const runZestFileSuite = async (testingModel: TestingModel) => {
  const { cases } = testingModel;
  const testCasesAsync = cases.map(runTestCase(testingModel));
  await Promise.all(testCasesAsync);
};
async function setupExecutionContext(
  testCase: TestingFunctionSnapshotTestCaseModel,
  testingModel: TestingModel
): Promise<TestCaseExecutionContext | false> {
  const { params } = testCase;
  const { first, second, third } = params;
  const firstValue = await getParamData(first);
  if (typeof firstValue !== 'string' && firstValue.status === 'failure') {
    logTestCasePreparationIssue(
      testingModel,
      testCase,
      'First parameter cannot be loaded'
    );
    return false;
  }

  if (second === undefined) {
    return {
      testing: testingModel.testing,
      title: testCase.title,
      params: {
        first: typeof firstValue === 'string' ? firstValue : firstValue.value,
      },
    };
  }

  const secondValue = await getParamData(second);
  if (typeof secondValue !== 'string' && secondValue.status === 'failure') {
    logTestCasePreparationIssue(
      testingModel,
      testCase,
      'Second parameter cannot be loaded'
    );
    return false;
  }

  if (third === undefined) {
    return {
      testing: testingModel.testing,
      title: testCase.title,
      params: {
        first: typeof firstValue === 'string' ? firstValue : firstValue.value,
        second:
          typeof secondValue === 'string' ? secondValue : secondValue.value,
      },
    };
  }

  const thirdValue = await getParamData(third);
  if (typeof thirdValue !== 'string' && thirdValue.status === 'failure') {
    logTestCasePreparationIssue(
      testingModel,
      testCase,
      'Third parameter cannot be loaded'
    );
    return false;
  }
  return {
    testing: testingModel.testing,
    title: testCase.title,
    params: {
      first: typeof firstValue === 'string' ? firstValue : firstValue.value,
      second: typeof secondValue === 'string' ? secondValue : secondValue.value,
      third: typeof thirdValue === 'string' ? thirdValue : thirdValue.value,
    },
  };
}
