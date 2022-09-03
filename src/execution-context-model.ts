import { AnyFunctionModel } from './testing-model.js';

export interface TestCaseExecutionContext {
  testing: AnyFunctionModel;
  title: string;
  params: {
    first: object | string;
    second?: object | string;
    third?: object | string;
  };
}

export type TestCaseResult =
  | {
      status: 'success';
      context: TestCaseExecutionContext;
    }
  | {
      status: 'failure';
      context: TestCaseExecutionContext;
      message: string;
      actual?: string;
      expected?: string;
    };
