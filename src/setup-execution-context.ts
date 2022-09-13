import { TestCaseExecutionContext } from './execution-context-model.js';
import { getParamData } from './get-param-data.js';
import { ReportTracker } from './reporter-model.js';
import { reportCase } from './reporter.js';
import { getSnapshotFilename } from './snapshot-creator.js';
import { readDataFileSafely } from './testing-io.js';
import {
  TestingModel,
  TestingFunctionSnapshotTestCaseModel,
} from './testing-model.js';

export async function setupExecutionContext(
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
