import {
  TestCaseExecutionContext,
  TumbleWrapper,
} from './execution-context-model.js';
import { getParamData } from './get-param-data.js';
import { ReportTracker } from './reporter-model.js';
import { reportCase } from './reporter.js';
import { getSnapshotFilename } from './snapshot-creator.js';
import { readDataFileSafely } from './testing-io.js';
import {
  TestingModel,
  TestingFunctionSnapshotTestCaseModel,
} from './testing-model.js';
import { createTransformerFunctions } from './transformer-executor.js';
import { createTumbleFunction } from './tumble-executor.js';

export async function setupExecutionContext(
  reportTracker: ReportTracker,
  testCase: TestingFunctionSnapshotTestCaseModel,
  testingModel: TestingModel
): Promise<TestCaseExecutionContext | false> {
  const { params } = testCase;

  const reportErrorCase = (message: string, stack?: string) => {
    reportCase(reportTracker, {
      title: testCase.title,
      fullTitle: testCase.title,
      file: testingModel.specFile,
      sourceFile: testingModel.testing.import,
      snapshotFile: getSnapshotFilename(testingModel, testCase),
      duration: 0,
      err: {
        code: 'ERR_GENERAL',
        message,
        stack,
      },
    });
  };

  const reportImpossibleParameter = (name: 'First' | 'Second' | 'Third') => {
    reportErrorCase(
      `${name} parameter is absent. It should never happen (527321)`
    );
  };

  const reportNotLoadableParameter = (
    name: 'First' | 'Second' | 'Third',
    message: string,
    stack?: string
  ) => {
    reportErrorCase(
      `${name} parameter cannot be loaded (230665): ${message}`,
      stack
    );
  };

  const transformerHolder = await createTransformerFunctions(
    testCase.result?.transform === undefined ? [] : testCase.result?.transform
  );

  if (transformerHolder.status === 'failure') {
    reportErrorCase(
      `${transformerHolder.message} for transform in result (896979)`
    );
    return false;
  }

  const transform = transformerHolder.func;

  let tumble: TumbleWrapper | undefined;
  if (testCase.tumble !== undefined) {
    const tumbleHolder = await createTumbleFunction(testCase.tumble);
    if (tumbleHolder.status === 'failure') {
      reportErrorCase(`${tumbleHolder.message} for tumble in result (743857)`);
      return false;
    } else {
      tumble = tumbleHolder.component;
    }
  }

  const first = params[0];
  if (first === undefined) {
    reportImpossibleParameter('First');
    return false;
  }
  const firstValue = await getParamData(first);
  if (typeof firstValue !== 'string' && firstValue.status === 'failure') {
    reportNotLoadableParameter('First', firstValue.message, firstValue.stack);
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
    transform,
    tumble,
  };
  if (params.length === 1) {
    return {
      ...defaultSuccess,
      params: {
        count: 1,
        first: firstValue.value,
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
    reportNotLoadableParameter(
      'Second',
      secondValue.message,
      secondValue.stack
    );
    return false;
  }

  if (params.length === 2) {
    return {
      ...defaultSuccess,
      params: {
        count: 2,
        first: firstValue.value,
        second: secondValue.value,
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
    reportNotLoadableParameter('Third', thirdValue.message, thirdValue.stack);
    return false;
  }
  return {
    ...defaultSuccess,
    params: {
      count: 3,
      first: firstValue.value,
      second: secondValue.value,
      third: thirdValue.value,
    },
  };
}
