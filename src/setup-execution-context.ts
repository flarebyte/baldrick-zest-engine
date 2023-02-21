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
  const { name, params, title, snapshot } = testCase;
  const { runOpts, testingModel, reportTracker } = opts;
  const { specFile, inject } = runOpts;
  const { testing } = testingModel;
  const { filename } = inject;

  const reportErrorCase = (message: string, stack?: string) => {
    reportCase(reportTracker, {
      title,
      fullTitle: title,
      file: specFile,
      sourceFile: testing.import,
      snapshotFile: filename.getSnapshotFilename(specFile, name, {
        parser: snapshot,
      }),
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
    inject,
    testCase.result?.transform === undefined ? [] : testCase.result?.transform // eslint-disable-line unicorn/consistent-destructuring
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
    const tumbleHolder = await createTumbleFunction(inject, testCase.tumble);
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
  const firstValue = await getParamData(inject, first);
  if (typeof firstValue !== 'string' && firstValue.status === 'failure') {
    reportNotLoadableParameter(
      'First',
      firstValue.error.message,
      firstValue.error.stack
    );
    return false;
  }
  const expectedValue = await readDataFileSafely(
    inject,
    filename.getSnapshotFilename(specFile, name, {
      parser: snapshot,
    }),
    {
      parser: snapshot,
    }
  );
  const isNewSnapshot = expectedValue.status === 'failure';

  const expected =
    expectedValue.status === 'success' ? expectedValue.value : undefined;

  const defaultSuccess = {
    testing,
    title,
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
  const secondValue = await getParamData(inject, second);
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
  const thirdValue = await getParamData(inject, third);
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
