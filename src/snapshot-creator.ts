import path from 'node:path';
import { diff } from 'jest-diff';
import { TestCaseExecuteResult } from './execution-context-model.js';
import { writeSnapshotFile } from './testing-io.js';
import {
  FileParser,
  TestingFunctionTestCaseModel,
  TestingModel,
} from './testing-model.js';

export const getSnapshotFilename = (
  testingModel: TestingModel,
  _testCase: TestingFunctionTestCaseModel
): string => {
  return path.join(testingModel.snapshotDir, 'temp.yaml');
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
  executeResult: TestCaseExecuteResult & { status: 'success' },
  snapshotFileName: string,
  parser: FileParser
): Promise<SnapshotResult> => {
  if (executeResult.context.expected === undefined) {
    await writeSnapshotFile(snapshotFileName, executeResult.actual, { parser });
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
    return diffString === null
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
    message: 'Types for actual and expected are different',
  };
};
