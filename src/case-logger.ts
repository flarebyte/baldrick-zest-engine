import { TestCaseResult } from './execution-context-model.js';
import {
  AnyFunctionModel,
  TestingFunctionTestCaseModel,
  TestingModel,
} from './testing-model.js';

const toFunctionInfo = (anyFunction: AnyFunctionModel): string => {
  switch (anyFunction.a) {
    case 'pure-function':
      return `${anyFunction.function}`;
    case 'static-method':
      return `${anyFunction.class}.${anyFunction.function}`;
  }
};

export const logTestCaseResult = (testCaseResult: TestCaseResult) => {
  if (testCaseResult.status === 'success') {
    console.info(
      `✓ Success for ${toFunctionInfo(testCaseResult.context.testing)}. ${
        testCaseResult.context.title
      }`
    );
  }
  if (testCaseResult.status === 'failure') {
    console.error(
      `✗ Failure for ${toFunctionInfo(testCaseResult.context.testing)}. ${
        testCaseResult.context.title
      } with message: ${testCaseResult.message}`,
      { actual: testCaseResult.actual, expected: testCaseResult.expected }
    );
  }
};

export const logTestCasePreparationIssue = (
  testingModel: TestingModel,
  testCase: TestingFunctionTestCaseModel,
  message: string
) => {
  console.error(
    `✗ Failure setting up for ${toFunctionInfo(testingModel.testing)}. ${
      testCase.title
    } with message: ${message}`
  );
};
