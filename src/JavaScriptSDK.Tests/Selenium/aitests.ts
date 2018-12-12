import { ApplicationInsightsCoreTests } from "./ApplicationInsightsCore.Tests";
var runTests = function() {
    new ApplicationInsightsCoreTests().registerTests();
}

runTests();

export { runTests };
