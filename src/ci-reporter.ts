import { ReportingCase } from './reporter-model.js';
import { TestingTodoTestCaseModel } from './testing-model.js';

export const ciReportStartSuite = (title: string, secondary: string) => {
  console.group(`${title}; ${secondary}`);
};
export const ciReportCase = (_reportingCase: ReportingCase) =>
  console.error('Not supported yet');

  export const ciReportTodo = (todoCase: TestingTodoTestCaseModel) => {
    console.info('. TODO' + ' ' +todoCase.title);
  };
  