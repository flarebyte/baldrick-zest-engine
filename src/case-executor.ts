import {
  TestCaseExecutionContext,
  TestCaseResult,
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
): Promise<TestCaseResult> => {
  if (context.testing.a === 'pure-function') {
    const importing = context.testing.import;
    const functionName = context.testing.function;
    const imported: FunctionImport = await import(importing);
    const typicalPureFunction = imported[functionName];
    if (typicalPureFunction === undefined) {
      const functionKeys = Object.keys(imported);
      return {
        status: 'failure',
        context,
        message: `Function ${functionName} is not exported in ${importing}. What about one of these: ${functionKeys}`,
      };
    }
    try {
      const result = typicalPureFunction(
        context.params.first,
        context.params.second,
        context.params.third
      );
      console.log(result);
      return {
        status: 'success',
        context,
      };
    } catch (error) {
      return {
        status: 'failure',
        context,
        message: `Function ${functionName} in ${importing} failed with ${getErrorMessage(
          error
        )}`,
      };
    }
  }
  return {
    status: 'failure',
    context,
    message: 'The context is not supported',
  };
};
