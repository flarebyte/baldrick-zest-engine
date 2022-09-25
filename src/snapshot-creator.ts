import { diff } from 'jest-diff';
import { TestCaseExecuteResult } from './execution-context-model.js';
import { writeSnapshotFile } from './testing-io.js';
import { ExternalInjection } from './run-opts-model.js';

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
  parser: string
): Promise<SnapshotResult> => {
  if (executeResult.value.context.expected === undefined) {
    await writeSnapshotFile(
      injection,
      snapshotFileName,
      executeResult.value.actual,
      {
        parser,
      }
    );
    return { status: 'success', actual: executeResult.value.actual };
  }

  const isSameType =
    (typeof executeResult.value.context.expected === 'string' &&
      typeof executeResult.value.actual === 'string') ||
    (typeof executeResult.value.context.expected === 'object' &&
      typeof executeResult.value.actual === 'object');
  if (isSameType) {
    const diffString = diff(
      executeResult.value.context.expected,
      executeResult.value.actual
    );
    if (diffString === null) {
      return {
        status: 'failure',
        actual: executeResult.value.actual,
        expected: executeResult.value.context.expected,
        message: 'Comparison with a null value',
      };
    }
    const hasNoDifference = diffString.includes(
      'Compared values have no visual difference'
    );
    return hasNoDifference
      ? { status: 'success', actual: executeResult.value.actual }
      : {
          status: 'failure',
          actual: executeResult.value.actual,
          expected: executeResult.value.context.expected,
          message: diffString,
        };
  }

  return {
    status: 'failure',
    actual: executeResult.value.actual,
    expected: executeResult.value.context.expected,
    message: 'Types for actual and expected are different (650705)',
  };
};
