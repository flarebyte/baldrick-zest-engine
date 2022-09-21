import { ReportTracker } from './reporter-model.js';
import { TestingModel } from './testing-model.js';

export interface ExternalInjection {
  fs: {
    readStringFile: (filename: string) => Promise<string>;
    writeStringFile: (filename: string, content: string) => Promise<void>;
  };
  filename: {
    getMochaFilename: (specFile: string) => string;
    getSnapshotFilename: (specFile: string, testCaseName: string) => string;
  };
}
export interface TestingRunOpts {
  snapshotDir: string;
  specDir: string;
  reportDir: string;
  mochaJsonReport: boolean;
  specFile: string;
  flags: string;
  inject: ExternalInjection;
}

export interface ZestFileSuiteOpts {
  reportTracker: ReportTracker;
  testingModel: TestingModel;
  runOpts: TestingRunOpts;
}
