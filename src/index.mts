import { reportMochaJson } from './mocha-json-reporter.js';
import { ReportTracker } from './reporter-model.js';
import { getZestYaml } from './testing-io.js';
import { runZestFileSuite } from './testing-runner.js';

interface TestingExternal {
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

interface TestingRunOpts {
  snapshotDir: string;
  specDir: string;
  reportDir: string;
  mochaJsonReport: boolean;
  specFile: string;
  flags: string;
  inject: TestingExternal;
}

const createReportTracker = (): ReportTracker => ({
  stats: {
    suites: 1,
    tests: 0,
    passes: 0,
    failures: 0,
    pending: 0,
    start: new Date().toISOString(),
    end: '',
    duration: Date.now(),
  },
  tests: [],
});

/**
 * Run the tests
 * @param opts options for the run
 */
export const run = async (opts: TestingRunOpts) => {
  const result = await getZestYaml(opts.specFile);
  if (result.status === 'invalid') {
    console.error(result);
  } else if (result.status === 'valid') {
    const reportTracker = createReportTracker();

    await runZestFileSuite(reportTracker, { ...result.value, ...opts });
    if (opts.mochaJsonReport) {
      await reportMochaJson(opts.reportDir, opts.specFile, reportTracker);
    }
  }
};
