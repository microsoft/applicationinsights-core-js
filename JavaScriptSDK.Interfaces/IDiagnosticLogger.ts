import { _InternalMessageId, LoggingSeverity } from "../JavaScriptSDK.Enums/LoggingEnums";
import { _InternalLogMessage } from "../JavaScriptSDK/DiagnosticLogger";

export default interface IDiagnosticLogger {

    enableDebugExceptions: () => boolean;
    verboseLogging: () => boolean;

    queue: Array<_InternalLogMessage>;

    /**
     * This method will throw exceptions in debug mode or attempt to log the error as a console warning.
     * @param severity {LoggingSeverity} - The severity of the log message
     * @param message {_InternalLogMessage} - The log message.
     */
    throwInternal(severity: LoggingSeverity, msgId: _InternalMessageId, msg: string, properties?: Object, isUserAct?: boolean): void;

    /**
     * This will write a warning to the console if possible
     * @param message {string} - The warning message
     */
    warnToConsole(message: string): void;

    /**
     * Resets the internal message count
     */
    resetInternalMessageCount(): void;

    /**
     * Clears the list of records indicating that internal message type was already logged
     */
    clearInternalMessageLoggedTypes(): void;

    /**
     * Sets the limit for the number of internal events before they are throttled
     * @param limit {number} - The throttle limit to set for internal events
     */
    setMaxInternalMessageLimit(limit: number): void;
}
