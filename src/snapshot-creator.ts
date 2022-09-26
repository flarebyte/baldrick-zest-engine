import { diff } from 'jest-diff';
import { TestCaseExecuteResult } from './execution-context-model.js';
import { writeSnapshotFile } from './testing-io.js';
import { ExternalInjection } from './run-opts-model.js';
import { Result, zestFail, zestOk } from './zest-railway.js';

type SnapshotResult = Result<
  string | object,
  {
    actual: string | object;
    expected: string | object;
    message: string;
  }
>;

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
    return zestOk(executeResult.value.actual);
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
      return zestFail({
        actual: executeResult.value.actual,
        expected: executeResult.value.context.expected,
        message: 'Comparison with a null value',
      });
    }
    const hasNoDifference = diffString.includes(
      'Compared values have no visual difference'
    );
    return hasNoDifference
      ? zestOk(executeResult.value.actual)
      : zestFail({
          actual: executeResult.value.actual,
          expected: executeResult.value.context.expected,
          message: diffString,
        });
  }

  return zestFail({
    actual: executeResult.value.actual,
    expected: executeResult.value.context.expected,
    message: 'Types for actual and expected are different (650705)',
  });
};
