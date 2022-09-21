import { ReportingCase } from './reporter-model.js';

export const ciReportStartSuite = (title: string, secondary: string) => {
  console.group(`${title}; ${secondary}`);
};
export const ciReportCase = (reportingCase: ReportingCase) => {
  if (reportingCase.err === undefined) {
    console.error(
      `✓ PASS ${reportingCase.title} ${reportingCase.snapshotFile}`
    );
    return;
  }

  if (reportingCase.err.code === 'ERR_GENERAL') {
    console.error(
      `✗ FAIL ${reportingCase.title} ${reportingCase.snapshotFile}`
    );
    console.info(reportingCase.err.message);
    return;
  }
  if (reportingCase.err.code === 'ERR_ASSERTION') {
    console.error(
      `✗ FAIL ${reportingCase.title} ${reportingCase.snapshotFile}`
    );
    console.info(reportingCase.err.message);
    if (reportingCase.err.stack !== undefined) {
      console.info(reportingCase.err.stack);
    }
    return;
  }
};

export const ciReportTodo = (title: string) => {
  console.info('. TODO' + ' ' + title);
};

export const ciReportSkipped = (title: string, reason: string) => {
  console.info('. SKIP' + ' ' + title + ' ' + reason);
};
