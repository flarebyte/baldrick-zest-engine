import { ReportingCase } from './reporter-model.js';
import { Chalk } from 'chalk';
const chalk = new Chalk();

// Inspired by AVA colors management
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
  console.group(colors.section(`⦿ ${title}`) + ' ' + colors.log(secondary));
};

export const prettyReportTodo = (title: string) => {
  console.info(colors.todo('. TODO') + ' ' + colors.title(title));
};

export const prettyReportSkipped = (title: string, reason: string) => {
  console.info(
    colors.skip('. SKIP') + ' ' + colors.title(title) + ' ' + colors.log(reason)
  );
};

const addSnapshot = (snapshotFile?: string) =>
  snapshotFile === undefined ? '' : '   ' + colors.log('📷 ' + snapshotFile);

export const prettyReportCase = (reportingCase: ReportingCase) => {
  if (reportingCase.err === undefined) {
    console.error(
      colors.pass('✓ PASS') +
        ' ' +
        colors.title(reportingCase.title) +
        addSnapshot(reportingCase.snapshotFile)
    );
    return;
  }
  if (reportingCase.err.code === 'ERR_GENERAL') {
    console.error(
      colors.error('✗ FAIL') +
        ' ' +
        colors.title(reportingCase.title) +
        addSnapshot(reportingCase.snapshotFile)
    );
    console.info(reportingCase.err.message);
    if (reportingCase.err.stack !== undefined) {
      console.info(colors.errorStack(reportingCase.err.stack));
    }
    console.info(colors.log('See ') + colors.errorSource(reportingCase.file));
    return;
  }
  if (reportingCase.err.code === 'ERR_ASSERTION') {
    console.error(
      colors.error('✗ FAIL') +
        ' ' +
        colors.title(reportingCase.title) +
        addSnapshot(reportingCase.snapshotFile)
    );
    console.info(reportingCase.err.message);
    console.info(colors.log('See ') + colors.errorSource(reportingCase.file));
  }
};
