import { ciReportCase, ciReportStartSuite, ciReportTodo } from './ci-reporter.js';
import { isCI } from './is-ci.js';
import { prettyReportCase, prettyReportStartSuite, prettyReportTodo } from './pretty-reporter.js';
import { ReportingCase } from './reporter-model.js';
import { TestingTodoTestCaseModel } from './testing-model.js';

export const reportStartSuite = (title: string, secondary: string) =>
  isCI ? ciReportStartSuite(title, secondary) : prettyReportStartSuite(title, secondary);
export const reportStopSuite = () => console.groupEnd();

export const reportCase = (reportingCase: ReportingCase) =>
  isCI ? ciReportCase(reportingCase) : prettyReportCase(reportingCase);

  export const reportTodo = (todoCase: TestingTodoTestCaseModel) =>
  isCI ? ciReportTodo(todoCase) : prettyReportTodo(todoCase);

