import { ReportingCase } from './reporter-model.js';
import { Chalk } from 'chalk';
const chalk = new Chalk();

const colors = {
  get log() {
    return chalk.gray;
  },
  get section() {
    return chalk.bold;
  },
  get title() {
    return chalk.bold;
  },
  get error() {
    return chalk.red;
  },
  get skip() {
    return chalk.yellow;
  },
  get todo() {
    return chalk.blue;
  },
  get pass() {
    return chalk.green;
  },
  get duration() {
    return chalk.gray.dim;
  },
  get errorSource() {
    return chalk.gray;
  },
  get errorStack() {
    return chalk.gray;
  },
  get errorStackInternal() {
    return chalk.gray.dim;
  },
  get stack() {
    return chalk.red;
  },
  get information() {
    return chalk.magenta;
  },
};

export const prettyReportStartSuite = (title: string, secondary: string) => {
  console.group(colors.section(title) + ' ' + colors.log(secondary));
};

export const prettyReportCase = (reportingCase: ReportingCase) => {
  if (reportingCase.err === undefined) {
    console.error(
      colors.pass('✓ PASS') + ' ' + colors.title(reportingCase.title)
    );
    return;
  }
  if (reportingCase.err.code === 'ERR_GENERAL') {
    console.error(
      colors.error('✗ FAIL') + ' ' + colors.title(reportingCase.title)
    );
    console.info(reportingCase.err.message);
    console.info(colors.log('See ') + colors.errorSource(reportingCase.file));
    return;
  }
  if (reportingCase.err.code === 'ERR_ASSERTION') {
    console.error(
      colors.error('✗ FAIL') + ' ' + colors.title(reportingCase.title)
    );
    console.info(reportingCase.err.message);
    console.info(colors.log('See ') + colors.errorSource(reportingCase.file));
  }
};
