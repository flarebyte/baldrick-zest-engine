import { executeCase } from './case-executor.js';
import { ReportingCase } from './reporter-model.js';
import {
  reportCase,
  reportSkipped,
  reportStartSuite,
  reportStopSuite,
  reportTodo,
} from './reporter.js';
import { ZestFileSuiteOpts } from './run-opts-model.js';
import { setupExecutionContext } from './setup-execution-context.js';
import { checkSnapshot } from './snapshot-creator.js';
import type { TestingFunctionTestCaseModel } from './testing-model.js';

const stringOrObjectToString = (value: object | string): string =>
  typeof value === 'string' ? value : JSON.stringify(value);

const runTestCase =
  (opts: ZestFileSuiteOpts) =>
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
        opts,
        testCase
      );
      if (!testCaseExecutionContext) {
        return;
      }

      const defaultSuccessReporting: ReportingCase = {
        title: testCase.title,
        fullTitle: testCase.title,
        file: opts.runOpts.specFile,
        sourceFile: opts.testingModel.testing.import,
        snapshotFile: opts.runOpts.inject.filename.getSnapshotFilename(
          opts.runOpts.specFile,
          testCase.name,
          { parser: testCase.snapshot}
        ),
        duration: 0,
      };

      const reportErrorCase = (message: string) => {
        reportCase(opts.reportTracker, {
          ...defaultSuccessReporting,
          err: {
            code: 'ERR_GENERAL',
            message,
            stack: '',
          },
        });
      };

      if (!opts.runOpts.inject.io.parsers.includes(testCase.snapshot)) {
        reportErrorCase(
          `Snapshot parser "${testCase.snapshot}" is not supported`
        );
        return;
      }
      const executed = await executeCase(opts.runOpts.inject,testCaseExecutionContext);
      if (executed.status === 'failure') {
        reportErrorCase(executed.error.message);
        return;
      } else {
        const snapshotResult = await checkSnapshot(
          opts.runOpts.inject,
          executed,
          opts.runOpts.inject.filename.getSnapshotFilename(
            opts.runOpts.specFile,
            testCase.name,
            { parser: testCase.snapshot}
          ),
          testCase.snapshot
        );
        if (snapshotResult.status === 'success') {
          reportCase(opts.reportTracker, defaultSuccessReporting);
        } else {
          reportCase(opts.reportTracker, {
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

export const runZestFileSuite = async (opts: ZestFileSuiteOpts) => {
  reportStartSuite(
    `Function ${opts.testingModel.testing.function}`,
    `${opts.testingModel.testing.import} | ${opts.runOpts.specFile}`
  );
  const { cases } = opts.testingModel;

  // Add the name to case object
  for (const caseKey in cases) {
    const newCase = cases[caseKey];
    if (newCase === undefined) {
      continue;
    }
    newCase.name = caseKey;
  }
  const caseList = Object.values(cases);
  const testCasesAsync = caseList.map(runTestCase(opts));
  await Promise.all(testCasesAsync);
  reportStopSuite();
};
