/**
 * Configurations for the Default Web SDK Extensions
 */
export interface IExtensionsConfig {
    emitLineDelimitedJson?: boolean;
    accountId?: string;
    sessionRenewalMs?: number;
    sessionExpirationMs?: number;
    maxBatchSizeInBytes?: number;
    maxBatchInterval?: number;
    enableDebug?: boolean;
    disableExceptionTracking?: boolean;
    disableTelemetry?: boolean;
    consoleLoggingLevel?: number;
    telemetryLoggingLevel?: number;
    diagnosticLogInterval?: number;
    samplingPercentage?: number;
    autoTrackPageVisitTime?: boolean;
    disableAjaxTracking?: boolean;
    disableFetchTracking?: boolean;
    overridePageViewDuration?: boolean;
    maxAjaxCallsPerView?: number;
    disableDataLossAnalysis?: boolean;
    disableCorrelationHeaders?: boolean;
    correlationHeaderExcludedDomains?: string[];
    disableFlushOnBeforeUnload?: boolean;
    enableSessionStorageBuffer?: boolean;
    isCookieUseDisabled?: boolean;
    cookieDomain?: string;
    isRetryDisabled?: boolean;
    url?: string;
    isStorageUseDisabled?: boolean;
    isBeaconApiDisabled?: boolean;
    sdkExtension?: string;
    isBrowserLinkTrackingEnabled?: boolean;
    appId?: string;
    enableCorsCorrelation?: boolean;
}
