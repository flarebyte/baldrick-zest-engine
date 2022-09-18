import { executeCase } from './case-executor.js';
import { ReportingCase, ReportTracker } from './reporter-model.js';
import {
  reportCase,
  reportSkipped,
  reportStartSuite,
  reportStopSuite,
  reportTodo,
} from './reporter.js';
import { setupExecutionContext } from './setup-execution-context.js';
import { checkSnapshot, getSnapshotFilename } from './snapshot-creator.js';
import type {
  TestingFunctionTestCaseModel,
  TestingModel,
} from './testing-model.js';

const stringOrObjectToString = (value: object | string): string =>
  typeof value === 'string' ? value : JSON.stringify(value);

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
        sourceFile: testingModel.testing.import,
        snapshotFile: getSnapshotFilename(testingModel, testCase),
        duration: 0,
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
    `Function ${testingModel.testing.function}`,
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
