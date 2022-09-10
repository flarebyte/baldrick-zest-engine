import {
  TestCaseExecutionContext,
  TestCaseExecuteResult,
} from './execution-context-model.js';

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

type FunctionImportFunctionOneParam = {
  [k: string]: PureFunctionOneParam;
};

type FunctionImportFunctionTwoParams = {
  [k: string]: PureFunctionTwoParams;
};

type FunctionImportFunctionThreeParams = {
  [k: string]: PureFunctionThreeParams;
};

type ImportedFunction =
  | {
      style: 'function a';
      func: PureFunctionOneParam;
    }
  | {
      style: 'function a b';
      func: PureFunctionTwoParams;
    }
  | {
      style: 'function a b c';
      func: PureFunctionThreeParams;
    }
  | {
      style: 'no function';
      available: string[];
    }
  | {
      style: 'not supported';
    };

const getImportedFunction = async (
  context: TestCaseExecutionContext
): Promise<ImportedFunction> => {
  const importing = context.testing.import;
  const functionName = context.testing.function;
  if (context.testing.style === 'function a') {
    const imported: FunctionImportFunctionOneParam = await import(importing);
    const functionWithOneParam = imported[functionName];
    return functionWithOneParam === undefined
      ? { style: 'no function', available: Object.keys(imported) }
      : { style: 'function a', func: functionWithOneParam };
  }
  if (context.testing.style === 'function a b') {
    const imported: FunctionImportFunctionTwoParams = await import(importing);
    const functionWithTwoParams = imported[functionName];
    return functionWithTwoParams === undefined
      ? { style: 'no function', available: Object.keys(imported) }
      : { style: 'function a b', func: functionWithTwoParams };
  }

  if (context.testing.style === 'function a b c') {
    const imported: FunctionImportFunctionThreeParams = await import(importing);
    const functionWithThreeParams = imported[functionName];
    return functionWithThreeParams === undefined
      ? { style: 'no function', available: Object.keys(imported) }
      : { style: 'function a b c', func: functionWithThreeParams };
  }
  return { style: 'not supported' };
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
export const executeCase = async (
  context: TestCaseExecutionContext
): Promise<TestCaseExecuteResult> => {
  if (
    context.testing.style === 'function a' ||
    context.testing.style === 'function a b' ||
    context.testing.style === 'function a b c'
  ) {
    const thisFunction = await getImportedFunction(context);
    if (thisFunction.style === 'not supported') {
      return {
        status: 'failure',
        context,
        message: `No function including ${context.testing.function} is exported in ${context.testing.import}.(616289)`,
      };
    }

    if (thisFunction.style === 'no function') {
      return {
        status: 'failure',
        context,
        message: `Function ${context.testing.function} is not exported in ${context.testing.import}. What about one of these: ${thisFunction.available} (978799)`,
      };
    }
    try {
      let result: object | string;
      if (thisFunction.style === 'function a' && context.params.count === 1) {
        result = thisFunction.func(context.params.first);
      } else if (
        thisFunction.style === 'function a b' &&
        context.params.count === 2
      ) {
        result = thisFunction.func(context.params.first, context.params.second);
      } else if (
        thisFunction.style === 'function a b c' &&
        context.params.count === 3
      ) {
        result = thisFunction.func(
          context.params.first,
          context.params.second,
          context.params.third
        );
      } else {
        return {
          status: 'failure',
          context,
          message: `Function ${context.testing.function} in ${context.testing.import} (814233)`,
        };
      }
      return {
        status: 'success',
        context,
        actual: result,
      };
    } catch (error) {
      return {
        status: 'failure',
        context,
        message: `Function ${context.testing.function} in ${
          context.testing.import
        } failed with ${getErrorMessage(error)} (148281)`,
      };
    }
  }
  return {
    status: 'failure',
    context,
    message: `The context is not supported: ${context.testing.style} (208765)`,
  };
};
