import {
  TestCaseExecutionContext,
  TestCaseExecuteResult,
  WrappedFunction,
  TumbleWrapper,
  Params,
} from './execution-context-model.js';
import { friendlyImport } from './friendly-importer.js';

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

const expectAsObject = (value: string | object): object => {
  if (typeof value !== 'object') {
    throw new Error('Tumble operations are only applicable to objects');
  }
  return value;
};

export const executeCase = async (
  context: TestCaseExecutionContext
): Promise<TestCaseExecuteResult> => {
  if (context.testing.style === 'function a') {
    const thisFunction = await friendlyImport<PureFunctionOneParam>(
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
          ? thisFunction.component(context.params.first)
          : runWithTumble(thisFunction, context.tumble, context.params);
      const transformed = context.transform(result);
      return successWithResult(transformed);
    } catch (error) {
      return failWithThrownError(error);
    }
  }
  if (context.testing.style === 'function a b') {
    const thisFunction = await friendlyImport<PureFunctionTwoParams>(
      context.testing.import,
      context.testing.function
    );
    if (thisFunction.status !== 'success') {
      return failImporting(thisFunction);
    }

    try {
      if (context.params.count === 2) {
        const result = thisFunction.component(
          context.params.first,
          context.params.second
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
      context.testing.import,
      context.testing.function
    );
    if (thisFunction.status !== 'success') {
      return failImporting(thisFunction);
    }

    try {
      if (context.params.count === 3) {
        const result = thisFunction.component(
          context.params.first,
          context.params.second,
          context.params.third
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
  return {
    status: 'failure',
    context,
    message: `The context is not supported: ${context.testing.style} (208765)`,
  };

  function successWithResult(
    result: string | object
  ): TestCaseExecuteResult | PromiseLike<TestCaseExecuteResult> {
    return {
      status: 'success',
      context,
      actual: result,
    };
  }

  function failWithThrownError(
    error: unknown
  ): TestCaseExecuteResult | PromiseLike<TestCaseExecuteResult> {
    return {
      status: 'failure',
      context,
      message: `Function ${context.testing.function} in ${
        context.testing.import
      } failed with ${getErrorMessage(error)} (148281)`,
    };
  }

  function failedWithWrongParameterNumber():
    | TestCaseExecuteResult
    | PromiseLike<TestCaseExecuteResult> {
    return {
      status: 'failure',
      context,
      message: `Function ${context.testing.function} in ${context.testing.import} have the wrong number of parameter ${context.params.count} (814233)`,
    };
  }

  function failImporting(
    thisFunction:
      | { status: 'no component'; available: string[] }
      | { status: 'import failed' }
  ): TestCaseExecuteResult | PromiseLike<TestCaseExecuteResult> {
    return {
      status: 'failure',
      context,
      message:
        thisFunction.status === 'import failed'
          ? `No function including ${context.testing.function} is exported in ${context.testing.import}.(616289)`
          : `Function ${context.testing.function} is not exported in ${context.testing.import}. What about one of these: ${thisFunction.available} (978799)`,
    };
  }
};
function runWithTumble(
  thisFunction: { status: 'success'; component: PureFunctionOneParam },
  tumble: TumbleWrapper,
  params: Params
) {
  const wrapped: WrappedFunction = (values: object[]) => {
    if (values[0] === undefined) {
      throw new Error('At least one parameter was expected (812188)');
    }
    return expectAsObject(thisFunction.component(values[0]));
  };
  const result = tumble(wrapped, [expectAsObject(params.first)]);
  return result;
}
