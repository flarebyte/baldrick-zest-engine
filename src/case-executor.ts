import {
  TestCaseExecutionContext,
  TestCaseExecuteResult,
  WrappedFunction,
  TumbleWrapper,
  Params,
} from './execution-context-model.js';
import { friendlyImport } from './friendly-importer.js';
import { ExternalInjection } from './run-opts-model.js';
import { zestFail, zestOk } from './zest-railway.js';

type PureFunctionOneParam = (first: object | string) => object | string;

type PureFunctionTwoParams = (
  first: object | string,
  second: object | string
) => object | string;

type PureFunctionThreeParams = (
  first: object | string,
  second: object | string,
  third: object | string
) => object | string;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) return error.stack;
  return undefined;
}

const expectAsObject = (value: string | object): object => {
  if (typeof value !== 'object') {
    throw new TypeError('Tumble operations are only applicable to objects');
  }
  return value;
};

export const executeCase = async (
  injection: ExternalInjection,
  context: TestCaseExecutionContext
): Promise<TestCaseExecuteResult> => {
  if (context.testing.style === 'function a') {
    const thisFunction = await friendlyImport<PureFunctionOneParam>(
      injection,
      context.testing.import,
      context.testing.function
    );
    if (thisFunction.status !== 'success') {
      return failImporting(thisFunction);
    }
    if (context.params.count !== 1) {
      return failedWithWrongParameterNumber();
    }

    try {
      const result =
        context.tumble === undefined
          ? thisFunction.value(context.params.first)
          : runWithTumbleOneParam(thisFunction, context.tumble, context.params);
      const transformed = context.transform(result);
      return successWithResult(transformed);
    } catch (error) {
      return failWithThrownError(error);
    }
  }
  if (context.testing.style === 'function a b') {
    const thisFunction = await friendlyImport<PureFunctionTwoParams>(
      injection,
      context.testing.import,
      context.testing.function
    );
    if (thisFunction.status !== 'success') {
      return failImporting(thisFunction);
    }

    try {
      if (context.params.count === 2) {
        const result =
          context.tumble === undefined
            ? thisFunction.value(
                context.params.first,
                context.params.second
              )
            : runWithTumbleTwoParams(
                thisFunction,
                context.tumble,
                context.params
              );
        const transformed = context.transform(result);
        return successWithResult(transformed);
      } else {
        return failedWithWrongParameterNumber();
      }
    } catch (error) {
      return failWithThrownError(error);
    }
  }
  if (context.testing.style === 'function a b c') {
    const thisFunction = await friendlyImport<PureFunctionThreeParams>(
      injection,
      context.testing.import,
      context.testing.function
    );
    if (thisFunction.status !== 'success') {
      return failImporting(thisFunction);
    }

    try {
      if (context.params.count === 3) {
        const result =
          context.tumble === undefined
            ? thisFunction.value(
                context.params.first,
                context.params.second,
                context.params.third
              )
            : runWithTumbleThreeParams(
                thisFunction,
                context.tumble,
                context.params
              );

        const transformed = context.transform(result);
        return successWithResult(transformed);
      } else {
        return failedWithWrongParameterNumber();
      }
    } catch (error) {
      return failWithThrownError(error);
    }
  }
  return zestFail({
    context,
    message: `The context is not supported: ${context.testing.style} (208765)`,
  });

  function successWithResult(
    result: string | object
  ): TestCaseExecuteResult | PromiseLike<TestCaseExecuteResult> {
    return zestOk({
      context,
      actual: result,
    });
  }

  function failWithThrownError(
    error: unknown
  ): TestCaseExecuteResult | PromiseLike<TestCaseExecuteResult> {
    return zestFail({
      context,
      message: `Function ${context.testing.function} in ${
        context.testing.import
      } failed with ${getErrorMessage(error)} (148281)`,
      stack: getErrorStack(error),
    });
  }

  function failedWithWrongParameterNumber():
    | TestCaseExecuteResult
    | PromiseLike<TestCaseExecuteResult> {
    return zestFail({
      context,
      message: `Function ${context.testing.function} in ${context.testing.import} have the wrong number of parameter ${context.params.count} (814233)`,
    });
  }

  function failImporting(thisFunction: {
    status: 'failure';
    error: { message: string; stack?: string };
  }): TestCaseExecuteResult | PromiseLike<TestCaseExecuteResult> {
    return zestFail({
      context,
      message: `Trying importing function ${context.testing.function} from ${context.testing.import}: ${thisFunction.error.message}.(616289)`,
      stack: thisFunction.error.stack,
    });
  }
};
function runWithTumbleOneParam(
  thisFunction: { status: 'success'; value: PureFunctionOneParam },
  tumble: TumbleWrapper,
  params: Params & { count: 1 }
) {
  const wrapped: WrappedFunction = (values: object[]) => {
    if (values[0] === undefined) {
      throw new Error('At least one parameter was expected (812188)');
    }
    return expectAsObject(thisFunction.value(values[0]));
  };
  const result = tumble(wrapped, [expectAsObject(params.first)]);
  return result;
}

function runWithTumbleTwoParams(
  thisFunction: { status: 'success'; value: PureFunctionTwoParams },
  tumble: TumbleWrapper,
  params: Params & { count: 2 }
) {
  const wrapped: WrappedFunction = (values: object[]) => {
    if (values[0] === undefined || values[1] === undefined) {
      throw new Error('At least two parameters were expected (988559)');
    }
    return expectAsObject(thisFunction.value(values[0], values[1]));
  };
  const result = tumble(wrapped, [
    expectAsObject(params.first),
    expectAsObject(params.second),
  ]);
  return result;
}

function runWithTumbleThreeParams(
  thisFunction: { status: 'success'; value: PureFunctionThreeParams },
  tumble: TumbleWrapper,
  params: Params & { count: 3 }
) {
  const wrapped: WrappedFunction = (values: object[]) => {
    if (
      values[0] === undefined ||
      values[1] === undefined ||
      values[2] === undefined
    ) {
      throw new Error('At least three parameters were expected (578992)');
    }
    return expectAsObject(
      thisFunction.value(values[0], values[1], values[2])
    );
  };
  const result = tumble(wrapped, [
    expectAsObject(params.first),
    expectAsObject(params.second),
    expectAsObject(params.third),
  ]);
  return result;
}
