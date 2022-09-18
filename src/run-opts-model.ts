import { ReportTracker } from "./reporter-model.js";
import { TestingModel } from "./testing-model.js";

export interface ExternalInjection {
  fs: {
    mkdirRecursive: (path: string) => Promise<string | undefined>;
    readStringFile: (filename: string) => Promise<string>;
    writeStringFile: (filename: string, content: string) => Promise<void>;
  };
  path: {
    dirname: (path: string) => string;
    relative: (from: string, to: string) => string;
    join: (...paths: string[]) => string;
    basename: (path: string, ext?: string) => string;
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