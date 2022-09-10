import {
  TestCaseExecutionContext,
  TestCaseExecuteResult,
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
export const executeCase = async (
  context: TestCaseExecutionContext
): Promise<TestCaseExecuteResult> => {
  if (context.testing.style === 'function a') {
    const thisFunction = await friendlyImport<PureFunctionOneParam>(
      context.testing.import,
      context.testing.function
    );
    if (thisFunction.status !== 'success') {
      return {
        status: 'failure',
        context,
        message:
          thisFunction.status === 'import failed'
            ? `No function including ${context.testing.function} is exported in ${context.testing.import}.(616289)`
            : `Function ${context.testing.function} is not exported in ${context.testing.import}. What about one of these: ${thisFunction.available} (978799)`,
      };
    }

    try {
      if (context.params.count === 1) {
        const result = thisFunction.component(context.params.first);
        return {
          status: 'success',
          context,
          actual: result,
        };
      } else {
        return {
          status: 'failure',
          context,
          message: `Function ${context.testing.function} in ${context.testing.import} have the wrong number of parameter ${context.params.count} (814233)`,
        };
      }
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
  if (context.testing.style === 'function a b') {
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
  if (context.testing.style === 'function a b c') {
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
