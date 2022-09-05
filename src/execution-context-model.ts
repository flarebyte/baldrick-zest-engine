import { AnyFunctionModel } from './testing-model.js';

export interface TestCaseExecutionContext {
  testing: AnyFunctionModel;
  title: string;
  params: {
    first: object | string;
    second?: object | string;
    third?: object | string;
  };
  expected?: object | string;
}

export type TestCaseExecuteResult =
  | {
      status: 'success';
      context: TestCaseExecutionContext;
      actual: object | string;
    }
  | {
      status: 'failure';
      context: TestCaseExecutionContext;
      message: string;
    };
