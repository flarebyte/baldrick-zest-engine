import { relative, join, dirname } from 'node:path';
import { diff } from 'jest-diff';
import { TestCaseExecuteResult } from './execution-context-model.js';
import { writeSnapshotFile } from './testing-io.js';
import {
  FileParser,
  TestingFunctionTestCaseModel,
} from './testing-model.js';
import { ExternalInjection, ZestFileSuiteOpts } from './run-opts-model.js';

export const getSnapshotFilename = (
  opts: ZestFileSuiteOpts,
  testCase: TestingFunctionTestCaseModel
): string => {
  const specFileBase = relative(
    opts.runOpts.specDir,
    opts.runOpts.specFile
  ).replace('.zest.yaml', '');
  const snaphotFilename = `${specFileBase}--${testCase.name}.yaml`;
  return join(opts.runOpts.snapshotDir, snaphotFilename);
};

type SnapshotResult =
  | {
      status: 'success';
      actual: string | object;
    }
  | {
      status: 'failure';
      actual: string | object;
      expected: string | object;
      message: string;
    };

export const checkSnapshot = async (
  injection: ExternalInjection,
  executeResult: TestCaseExecuteResult & { status: 'success' },
  snapshotFileName: string,
  parser: FileParser
): Promise<SnapshotResult> => {
  if (executeResult.context.expected === undefined) {
    await injection.fs.mkdirRecursive(dirname(snapshotFileName));
    await writeSnapshotFile(injection, snapshotFileName, executeResult.actual, {
      parser,
    });
    return { status: 'success', actual: executeResult.actual };
  }

  const isSameType =
    (typeof executeResult.context.expected === 'string' &&
      typeof executeResult.actual === 'string') ||
    (typeof executeResult.context.expected === 'object' &&
      typeof executeResult.actual === 'object');
  if (isSameType) {
    const diffString = diff(
      executeResult.context.expected,
      executeResult.actual
    );
    if (diffString === null) {
      return {
        status: 'failure',
        actual: executeResult.actual,
        expected: executeResult.context.expected,
        message: 'Comparison with a null value',
      };
    }
    const hasNoDifference = diffString.includes(
      'Compared values have no visual difference'
    );
    return hasNoDifference
      ? { status: 'success', actual: executeResult.actual }
      : {
          status: 'failure',
          actual: executeResult.actual,
          expected: executeResult.context.expected,
          message: diffString,
        };
  }

  return {
    status: 'failure',
    actual: executeResult.actual,
    expected: executeResult.context.expected,
    message: 'Types for actual and expected are different (650705)',
  };
};
