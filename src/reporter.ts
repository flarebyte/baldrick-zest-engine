import { ciReportCase, ciReportStartSuite } from './ci-reporter.js';
import { isCI } from './is-ci.js';
import { prettyReportCase, prettyReportStartSuite } from './pretty-reporter.js';
import { ReportingCase } from './reporter-model.js';

export const reportStartSuite = (title: string, secondary: string) =>
  isCI ? ciReportStartSuite(title, secondary) : prettyReportStartSuite(title, secondary);
export const reportStopSuite = () => console.groupEnd();

export const reportCase = (reportingCase: ReportingCase) =>
  isCI ? ciReportCase(reportingCase) : prettyReportCase(reportingCase);
