import path from 'node:path';
import { TestCaseExecuteResult, TestCaseExecutionContext } from './execution-context-model.js';
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
  executeResult: TestCaseExecuteResult & { status: 'success'},
  snapshotFileName: string,
  parser: FileParser,
) => {
  if (executeResult.context.expected === undefined) {
    await writeSnapshotFile(snapshotFileName, executeResult.actual, { parser });
    return;
  }
};
