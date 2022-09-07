import { ReportingCase } from './reporter-model.js';

export const ciReportStartSuite = (title: string, secondary: string) => {
  console.group(`${title}; ${secondary}`);
};
export const ciReportCase = (_reportingCase: ReportingCase) =>
  console.error('Not supported yet');

export const ciReportTodo = (title: string) => {
  console.info('. TODO' + ' ' + title);
};

export const ciReportSkipped = (title: string, reason: string) => {
  console.info('. SKIP' + ' ' + title + ' ' + reason);
};
