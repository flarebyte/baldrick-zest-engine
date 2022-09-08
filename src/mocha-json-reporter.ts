import path from 'node:path';
import { ReportTracker } from "./reporter-model.js";

export const getMochaReportFilename = (
    reportDir: string,
    specFile: string
  ): string => {
    const specFileBase = path
      .relative(testingModel.specDir, testingModel.specFile)
      .replace('.zest.yaml', '');
    const snaphotFilename = `${specFileBase}-${testCase.name}.yaml`;
    return path.join(testingModel.snapshotDir, snaphotFilename);
  };

export const reportMochaJson = async (filename: string, reportTracker: ReportTracker) => {

}