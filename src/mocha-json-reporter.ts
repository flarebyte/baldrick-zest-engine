import { basename, join } from 'node:path';
import { writeFile } from 'node:fs/promises';
import { FullReport, ReportTracker } from './reporter-model.js';
import { mkdirForFile } from './fs-utils.js';

const getMochaReportFilename = (
  reportDir: string,
  specFile: string
): string => {
  const specFileBase = basename(specFile).replace('.zest.yaml', '');
  const reportFilename = `report-${specFileBase}.mocha.json`;
  return join(reportDir, reportFilename);
};

const expandReportTracker = (reportTracker: ReportTracker): FullReport => {
  const passes = reportTracker.tests.filter((test) => test.err === undefined);
  const failures = reportTracker.tests.filter((test) => test.err !== undefined);
  const duration = reportTracker.tests.reduce((sum, t) => sum + t.duration, 0);
  return {
    stats: {
      ...reportTracker.stats,
      end: new Date().toISOString(),
      passes: passes.length,
      failures: failures.length,
      duration,
    },
    tests: [...reportTracker.tests],
    passes,
    failures,
    pending: [],
  };
};

export const reportMochaJson = async (
  reportDir: string,
  specFile: string,
  reportTracker: ReportTracker
) => {
  const reportFilename = getMochaReportFilename(reportDir, specFile);
  const fullReport = expandReportTracker(reportTracker);
  const content = JSON.stringify(fullReport, null, 2);
  await mkdirForFile(reportFilename);
  await writeFile(reportFilename, content);
};
