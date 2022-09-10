import { executeCase } from './case-executor.js';
import { TestCaseExecutionContext } from './execution-context-model.js';
import { ReportingCase, ReportTracker } from './reporter-model.js';
import {
  reportCase,
  reportSkipped,
  reportStartSuite,
  reportStopSuite,
  reportTodo,
} from './reporter.js';
import { checkSnapshot, getSnapshotFilename } from './snapshot-creator.js';
import { readDataFileSafely } from './testing-io.js';
import type {
  TestingFunctionTestCaseModel,
  TestingModel,
  FunctionParamData,
  TestingFunctionSnapshotTestCaseModel,
} from './testing-model.js';

const stringOrObjectToString = (value: object | string): string =>
  typeof value === 'string' ? value : JSON.stringify(value);

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
  (reportTracker: ReportTracker, testingModel: TestingModel) =>
  async (testCase: TestingFunctionTestCaseModel) => {
    if (testCase.a === 'todo') {
      reportTodo(testCase.title);
      return;
    } else if (testCase.a === 'snapshot') {
      if (typeof testCase.skip === 'string') {
        reportSkipped(testCase.title, testCase.skip);
        return;
      }
      const testCaseExecutionContext = await setupExecutionContext(
        reportTracker,
        testCase,
        testingModel
      );
      if (!testCaseExecutionContext) {
        return;
      }

      const defaultSuccessReporting: ReportingCase = {
        title: testCase.title,
        fullTitle: testCase.title,
        file: testingModel.specFile,
        duration: 0,
        currentRetry: 0,
      };

      const reportErrorCase = (message: string) => {
        reportCase(reportTracker, {
          ...defaultSuccessReporting,
          err: {
            code: 'ERR_GENERAL',
            message,
            stack: '',
          },
        });
      };
      const executed = await executeCase(testCaseExecutionContext);
      if (executed.status === 'failure') {
        reportErrorCase(executed.message);
        return;
      } else {
        const snapshotResult = await checkSnapshot(
          executed,
          getSnapshotFilename(testingModel, testCase),
          testCase.snapshot
        );
        if (snapshotResult.status === 'success') {
          reportCase(reportTracker, defaultSuccessReporting);
        } else {
          reportCase(reportTracker, {
            ...defaultSuccessReporting,
            err: {
              code: 'ERR_ASSERTION',
              message: snapshotResult.message,
              actual: stringOrObjectToString(snapshotResult.actual),
              expected: stringOrObjectToString(snapshotResult.expected),
              stack: '',
              operator: 'strictEqual',
            },
          });
        }
      }
    }
  };

export const runZestFileSuite = async (
  reportTracker: ReportTracker,
  testingModel: TestingModel
) => {
  reportStartSuite(
    testingModel.testing.function,
    `${testingModel.testing.import} | ${testingModel.specFile}`
  );
  const { cases } = testingModel;

  // Add the name to case object
  for (const caseKey in cases) {
    const newCase = cases[caseKey];
    if (newCase === undefined) {
      continue;
    }
    newCase.name = caseKey;
  }
  const caseList = Object.values(cases);
  const testCasesAsync = caseList.map(runTestCase(reportTracker, testingModel));
  await Promise.all(testCasesAsync);
  reportStopSuite();
};

async function setupExecutionContext(
  reportTracker: ReportTracker,
  testCase: TestingFunctionSnapshotTestCaseModel,
  testingModel: TestingModel
): Promise<TestCaseExecutionContext | false> {
  const { params } = testCase;

  const reportErrorCase = (message: string) => {
    reportCase(reportTracker, {
      title: testCase.title,
      fullTitle: testCase.title,
      file: testingModel.specFile,
      duration: 0,
      currentRetry: 0,
      err: {
        code: 'ERR_GENERAL',
        message,
        stack: '',
      },
    });
  };

  const reportImpossibleParameter = (name: 'First' | 'Second' | 'Third') => {
    reportErrorCase(
      `${name} parameter is absent. It should never happen (527321)`
    );
  };

  const reportNotLoadableParameter = (name: 'First' | 'Second' | 'Third') => {
    reportErrorCase(`${name} parameter parameter cannot be loaded (230665)`);
  };

  const first = params[0];
  if (first === undefined) {
    reportImpossibleParameter('First');
    return false;
  }
  const firstValue = await getParamData(first);
  if (typeof firstValue !== 'string' && firstValue.status === 'failure') {
    reportNotLoadableParameter('First');
    return false;
  }
  const expectedValue = await readDataFileSafely(
    getSnapshotFilename(testingModel, testCase),
    {
      parser: testCase.snapshot,
    }
  );
  const isNewSnapshot = expectedValue.status === 'failure';

  const expected =
    expectedValue.status === 'success' ? expectedValue.value : undefined;

  const defaultSuccess = {
    testing: testingModel.testing,
    title: testCase.title,
    expected,
    isNewSnapshot,
  };
  if (params.length === 1) {
    return {
      ...defaultSuccess,
      params: {
        count: 1,
        first: typeof firstValue === 'string' ? firstValue : firstValue.value,
      },
    };
  }

  const second = params[1];
  if (second === undefined) {
    reportImpossibleParameter('Second');
    return false;
  }
  const secondValue = await getParamData(second);
  if (typeof secondValue !== 'string' && secondValue.status === 'failure') {
    reportNotLoadableParameter('Second');
    return false;
  }

  if (params.length === 2) {
    return {
      ...defaultSuccess,
      params: {
        count: 2,
        first: typeof firstValue === 'string' ? firstValue : firstValue.value,
        second:
          typeof secondValue === 'string' ? secondValue : secondValue.value,
      },
    };
  }
  const third = params[2];
  if (third === undefined) {
    reportImpossibleParameter('Third');
    return false;
  }
  const thirdValue = await getParamData(third);
  if (typeof thirdValue !== 'string' && thirdValue.status === 'failure') {
    reportNotLoadableParameter('Third');
    return false;
  }
  return {
    ...defaultSuccess,
    params: {
      count: 3,
      first: typeof firstValue === 'string' ? firstValue : firstValue.value,
      second: typeof secondValue === 'string' ? secondValue : secondValue.value,
      third: typeof thirdValue === 'string' ? thirdValue : thirdValue.value,
    },
  };
}
