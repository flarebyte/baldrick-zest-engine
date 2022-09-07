export type ReportingError =
  | {
      code: 'ERR_GENERAL';
      stack: string;
      message: string;
    }
  | {
      code: 'ERR_ASSERTION';
      stack: string;
      message: string;
      actual: string;
      expected: string;
      operator: 'strictEqual';
    };

export interface ReportingCase {
  title: string;
  fullTitle: string;
  file: string;
  duration: number;
  currentRetry: 0;
  err?: ReportingError;
}

export interface ReportingStats {
  suites: number;
  tests: number;
  passes: number;
  pending: number;
  failures: number;
  start: string;
  end: string;
  duration: number;
}

export interface FullReport {
  stats: ReportingStats;
  tests: ReportingCase[];
  pending: ReportingCase[];
  failures: ReportingCase[];
  passes: ReportingCase[];
}
