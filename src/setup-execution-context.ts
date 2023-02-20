import {
  TestCaseExecutionContext,
  TumbleWrapper,
} from './execution-context-model.js';
import { getParamData } from './get-param-data.js';
import { reportCase } from './reporter.js';
import { ZestFileSuiteOpts } from './run-opts-model.js';
import { readDataFileSafely } from './testing-io.js';
import { TestingFunctionSnapshotTestCaseModel } from './testing-model.js';
import { createTransformerFunctions } from './transformer-executor.js';
import { createTumbleFunction } from './tumble-executor.js';

export async function setupExecutionContext(
  opts: ZestFileSuiteOpts,
  testCase: TestingFunctionSnapshotTestCaseModel
): Promise<TestCaseExecutionContext | false> {
  const { params } = testCase;

  const reportErrorCase = (message: string, stack?: string) => {
    reportCase(opts.reportTracker, {
      title: testCase.title,
      fullTitle: testCase.title,
      file: opts.runOpts.specFile,
      sourceFile: opts.testingModel.testing.import,
      snapshotFile: opts.runOpts.inject.filename.getSnapshotFilename(
        opts.runOpts.specFile,
        testCase.name,
        { parser: testCase.snapshot }
      ),
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
    opts.runOpts.inject,
    testCase.result?.transform === undefined ? [] : testCase.result?.transform
  );

  if (transformerHolder.status === 'failure') {
    reportErrorCase(
      `${transformerHolder.error.message} for transform in result (896979)`
    );
    return false;
  }

  const transform = transformerHolder.value;

  let tumble: TumbleWrapper | undefined;
  if (testCase.tumble !== undefined) {
    const tumbleHolder = await createTumbleFunction(
      opts.runOpts.inject,
      testCase.tumble
    );
    if (tumbleHolder.status === 'failure') {
      reportErrorCase(
        `${tumbleHolder.error.message} for tumble in result (743857)`
      );
      return false;
    } else {
      tumble = tumbleHolder.value;
    }
  }

  const first = params[0];
  if (first === undefined) {
    reportImpossibleParameter('First');
    return false;
  }
  const firstValue = await getParamData(opts.runOpts.inject, first);
  if (typeof firstValue !== 'string' && firstValue.status === 'failure') {
    reportNotLoadableParameter(
      'First',
      firstValue.error.message,
      firstValue.error.stack
    );
    return false;
  }
  const expectedValue = await readDataFileSafely(
    opts.runOpts.inject,
    opts.runOpts.inject.filename.getSnapshotFilename(
      opts.runOpts.specFile,
      testCase.name,
      { parser: testCase.snapshot }
    ),
    {
      parser: testCase.snapshot,
    }
  );
  const isNewSnapshot = expectedValue.status === 'failure';

  const expected =
    expectedValue.status === 'success' ? expectedValue.value : undefined;

  const defaultSuccess = {
    testing: opts.testingModel.testing,
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
  const secondValue = await getParamData(opts.runOpts.inject, second);
  if (typeof secondValue !== 'string' && secondValue.status === 'failure') {
    reportNotLoadableParameter(
      'Second',
      secondValue.error.message,
      secondValue.error.stack
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
  const thirdValue = await getParamData(opts.runOpts.inject, third);
  if (typeof thirdValue !== 'string' && thirdValue.status === 'failure') {
    reportNotLoadableParameter(
      'Third',
      thirdValue.error.message,
      thirdValue.error.stack
    );
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
