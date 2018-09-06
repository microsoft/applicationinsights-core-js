import { ITelemetryPlugin } from "./ITelemetryPlugin";

"use strict";

/**
 * Configuration provided to SDK core
 */
export interface IConfiguration {

    /**
    * Instrumentation key of resource
    */
    instrumentationKey: string; // todo: update later for multi-tenant?

    /**
     * Polling interval (in ms) for internal logging queue
     */
    diagnosticLoggingInterval?: number;

    /**
     * Maximum number of iKey transmitted logging telemetry per page view
     */
    maxMessageLimit?: number;

    /**
     * Console logging level
     * 0: ALL console logging off
     * 1: logs to console logs labelled at most as WARNING
     * 2: logs to console logs laballed at most as CRITICAL
     */
    loggingLevelConsole?: number;

    /**
     * Telemtry logging level to instrumentation key
     * 0: ALL iKey logging off
     * 1: logs to iKey logs labelled at most as WARNING
     * 2: logs to iKey logs laballed at most as CRITICAL
     */
    loggingLevelTelemetry?: number

    /**
     * If enabled, uncaught exceptions will be thrown to help with debugging
     */
    enableDebugExceptions?: boolean;
    
    /**
    * Endpoint where telemetry data is sent
    */
    endpointUrl?: string;

    /**
    * Extension configs loaded in SDK
    */
    extensionConfig?: { [key: string]: any }; // extension configs;

    /**
     * Additional plugins that should be loaded by core at runtime
     */
    extensions?: ITelemetryPlugin[];
}