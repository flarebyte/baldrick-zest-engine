import { ciReportCase } from "./ci-reporter.js"
import { prettyReportCase } from "./pretty-reporter.js"
import { ReportingCase } from "./reporter-model.js"

const isCi = () => !!process.env['CI']
export const reportCase = (reportingCase: ReportingCase): string => isCi() ? ciReportCase(reportingCase): prettyReportCase(reportingCase)
