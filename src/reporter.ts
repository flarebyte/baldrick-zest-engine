import {
  ciReportCase,
  ciReportSkipped,
  ciReportStartSuite,
  ciReportTodo,
} from './ci-reporter.js';
import { isCI } from './is-ci.js';
import {
  prettyReportCase,
  prettyReportSkipped,
  prettyReportStartSuite,
  prettyReportTodo,
} from './pretty-reporter.js';
import { ReportingCase } from './reporter-model.js';

export const reportStartSuite = (title: string, secondary: string) =>
  isCI
    ? ciReportStartSuite(title, secondary)
    : prettyReportStartSuite(title, secondary);
export const reportStopSuite = () => console.groupEnd();

export const reportCase = (reportingCase: ReportingCase) =>
  isCI ? ciReportCase(reportingCase) : prettyReportCase(reportingCase);

export const reportTodo = (title: string) =>
  isCI ? ciReportTodo(title) : prettyReportTodo(title);

export const reportSkipped = (title: string, reason: string) =>
  isCI ? ciReportSkipped(title, reason) : prettyReportSkipped(title, reason);
