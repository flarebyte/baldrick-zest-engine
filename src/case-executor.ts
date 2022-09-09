import {
  TestCaseExecutionContext,
  TestCaseExecuteResult,
} from './execution-context-model.js';

type TypicalPureFunction = (
  first: object | string,
  second?: object | string,
  third?: object | string
) => object | string;

type FunctionImport = {
  [k: string]: TypicalPureFunction;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
export const executeCase = async (
  context: TestCaseExecutionContext
): Promise<TestCaseExecuteResult> => {
  if (context.testing.style === 'pure-function') {
    const importing = context.testing.import;
    const functionName = context.testing.function;
    const imported: FunctionImport = await import(importing);
    const typicalPureFunction = imported[functionName];
    if (typicalPureFunction === undefined) {
      const functionKeys = Object.keys(imported);
      return {
        status: 'failure',
        context,
        message: `Function ${functionName} is not exported in ${importing}. What about one of these: ${functionKeys} (978799)`,
      };
    }
    try {
      const result = typicalPureFunction(
        context.params.first,
        context.params.second,
        context.params.third
      );
      return {
        status: 'success',
        context,
        actual: result,
      };
    } catch (error) {
      return {
        status: 'failure',
        context,
        message: `Function ${functionName} in ${importing} failed with ${getErrorMessage(
          error
        )} (148281)`,
      };
    }
  }
  return {
    status: 'failure',
    context,
    message: 'The context is not supported (208765)',
  };
};
