import { AnyTestedFunctionModel } from './testing-model.js';

type TransformerFunction = (value: object | string) => object | string;
export type WrappedFunction = (values: object[]) => object;

export type TumbleWrapper = (func: WrappedFunction, values: object[]) => object;

interface OneParam {
  count: 1;
  first: object | string;
}

interface TwoParams {
  count: 2;
  first: object | string;
  second: object | string;
}

interface ThreeParams {
  count: 3;
  first: object | string;
  second: object | string;
  third: object | string;
}

export type Params = OneParam | TwoParams | ThreeParams;

export interface TestCaseExecutionContext {
  testing: AnyTestedFunctionModel;
  title: string;
  params: Params;
  expected?: object | string;
  isNewSnapshot: boolean;
  transform: TransformerFunction;
  tumble?: TumbleWrapper;
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
