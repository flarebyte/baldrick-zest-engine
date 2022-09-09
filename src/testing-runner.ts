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
      const executed = await executeCase(testCaseExecutionContext);
      if (executed.status === 'failure') {
        reportCase(reportTracker, {
          ...defaultSuccessReporting,
          err: {
            code: 'ERR_GENERAL',
            message: executed.message,
            stack: '',
          },
        });

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
  const { first, second, third } = params;
  const defaultSuccessReporting: ReportingCase = {
    title: testCase.title,
    fullTitle: testCase.title,
    file: testingModel.specFile,
    duration: 0,
    currentRetry: 0,
  };
  const firstValue = await getParamData(first);
  if (typeof firstValue !== 'string' && firstValue.status === 'failure') {
    reportCase(reportTracker, {
      ...defaultSuccessReporting,
      err: {
        code: 'ERR_GENERAL',
        message: 'First parameter cannot be loaded (230665)',
        stack: '',
      },
    });
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

  if (second === undefined) {
    return {
      testing: testingModel.testing,
      title: testCase.title,
      params: {
        first: typeof firstValue === 'string' ? firstValue : firstValue.value,
      },
      expected,
      isNewSnapshot,
    };
  }

  const secondValue = await getParamData(second);
  if (typeof secondValue !== 'string' && secondValue.status === 'failure') {
    reportCase(reportTracker, {
      ...defaultSuccessReporting,
      err: {
        code: 'ERR_GENERAL',
        message: 'Second parameter cannot be loaded (831326)',
        stack: '',
      },
    });
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
      expected,
      isNewSnapshot,
    };
  }

  const thirdValue = await getParamData(third);
  if (typeof thirdValue !== 'string' && thirdValue.status === 'failure') {
    reportCase(reportTracker, {
      ...defaultSuccessReporting,
      err: {
        code: 'ERR_GENERAL',
        message: 'Third parameter cannot be loaded (759482)',
        stack: '',
      },
    });
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
    expected,
    isNewSnapshot,
  };
}
