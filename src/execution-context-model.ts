import { AnyTestedFunctionModel } from './testing-model.js';
import { Result } from './zest-railway.js';

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

export type TestCaseExecuteResult = Result<
  { context: TestCaseExecutionContext; actual: object | string },
  {
    context: TestCaseExecutionContext;
    message: string;
    stack?: string;
  }
>;
