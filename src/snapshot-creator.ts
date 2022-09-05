import path from 'node:path';
import { TestCaseExecutionContext } from './execution-context-model.js';
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

export const checkSnapshot = async (
  executionContext: TestCaseExecutionContext,
  snapshotFileName: string,
  parser: FileParser,
  actual: string | object
) => {
  if (executionContext.expected === undefined) {
    await writeSnapshotFile(snapshotFileName, actual, { parser });
    return;
  }
};
