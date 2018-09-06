"use strict"

import { _InternalMessageId, LoggingSeverity } from "../JavaScriptSDK.Enums/LoggingEnums";
import IDiagnosticLogging from "../JavaScriptSDK.Interfaces/IDiagnosticLogger";

export class _InternalLogMessage{
    public message: string;
    public messageId: _InternalMessageId;

    public static dataType: string = "LoggerData";

    /**
     * For user non actionable traces use AI Internal prefix.
     */
    private static AiNonUserActionablePrefix = "AI (Internal): ";

    /**
     * Prefix of the traces in portal.
     */
    private static AiUserActionablePrefix = "AI: ";

    constructor(msgId: _InternalMessageId, msg: string, isUserAct = false, properties?: Object) {

        this.messageId = msgId;
        this.message =
            (isUserAct ? _InternalLogMessage.AiUserActionablePrefix : _InternalLogMessage.AiNonUserActionablePrefix) +
            _InternalMessageId[msgId].toString();

        var diagnosticText =
            (msg ? " message:" + _InternalLogMessage.sanitizeDiagnosticText(msg) : "") +
            (properties ? " props:" + _InternalLogMessage.sanitizeDiagnosticText(JSON.stringify(properties)) : "");

        this.message += diagnosticText;
    }

    private static sanitizeDiagnosticText(text: string) {
        return "\"" + text.replace(/\"/g, "") + "\"";
    }
}

export class _InternalLogging implements IDiagnosticLogging {

    /**
    *  Session storage key for the prefix for the key indicating message type already logged
    */
    private AIInternalMessagePrefix: string = "AITR_";

    /**
     * When this is true the SDK will throw exceptions to aid in debugging.
     */
    public enableDebugExceptions = () => false;

    /**
     * When this is true the SDK will log more messages to aid in debugging.
     */
    public verboseLogging = () => false;

    /**
     * The internal logging queue
     */
    public queue: Array<_InternalLogMessage> = [];

    /**
     * The maximum number of internal messages allowed to be sent per page view
     */
    private MAX_INTERNAL_MESSAGE_LIMIT = 25;

    /**
     * Count of internal messages sent
     */
    private _messageCount = 0;

    /**
     * Holds information about what message types were already logged to console or sent to server.
     */
    private _messageLogged: { [type: string]: boolean } = {};

    /**
     * This method will throw exceptions in debug mode or attempt to log the error as a console warning.
     * @param severity {LoggingSeverity} - The severity of the log message
     * @param message {_InternalLogMessage} - The log message.
     */
    public throwInternal(severity: LoggingSeverity, msgId: _InternalMessageId, msg: string, properties?: Object, isUserAct = false) {
        let message = new _InternalLogMessage(msgId, msg, isUserAct, properties);

        if (this.enableDebugExceptions()) {
            throw message;
        } else {
            if (typeof (message) !== "undefined" && !!message) {
                if (typeof (message.message) !== "undefined") {
                    if (isUserAct) {
                        // check if this message type was already logged to console for this page view and if so, don't log it again
                        var messageKey = _InternalMessageId[message.messageId];

                        if (!this._messageLogged[messageKey] || this.verboseLogging()) {
                            this.warnToConsole(message.message);
                            this._messageLogged[messageKey] = true;
                        }
                    } else {
                        // don't log internal AI traces in the console, unless the verbose logging is enabled
                        if (this.verboseLogging()) {
                            this.warnToConsole(message.message);
                        }
                    }

                    this.logInternalMessage(severity, message);
                }
            }
        }
    }

    /**
     * This will write a warning to the console if possible
     * @param message {string} - The warning message
     */
    public warnToConsole(message: string) {
        if (typeof console !== "undefined" && !!console) {
            if (typeof console.warn === "function") {
                console.warn(message);
            } else if (typeof console.log === "function") {
                console.log(message);
            }
        }
    }

    /**
     * Resets the internal message count
     */
    public resetInternalMessageCount(): void {
        this._messageCount = 0;
        this._messageLogged = {};
    }

    /**
     * Clears the list of records indicating that internal message type was already logged
     */
    public clearInternalMessageLoggedTypes(): void {

    }

    /**
     * Sets the limit for the number of internal events before they are throttled
     * @param limit {number} - The throttle limit to set for internal events
     */
    public setMaxInternalMessageLimit(limit: number): void {
        if (!limit) {
            throw new Error('limit cannot be undefined.');
        }

        this.MAX_INTERNAL_MESSAGE_LIMIT = limit;
    }

    /**
     * Logs a message to the internal queue.
     * @param severity {LoggingSeverity} - The severity of the log message
     * @param message {_InternalLogMessage} - The message to log.
     */
    private logInternalMessage(severity: LoggingSeverity, message: _InternalLogMessage): void {
        if (this._areInternalMessagesThrottled()) {
            return;
        }

        // check if this message type was already logged for this session and if so, don't log it again
        var logMessage = true;
        var messageKey = this.AIInternalMessagePrefix + _InternalMessageId[message.messageId];

        // if the session storage is not available, limit to only one message type per page view
        if (this._messageLogged[messageKey]) {
            logMessage = false;
        } else {
            this._messageLogged[messageKey] = true;
        }

        if (logMessage) {
            // Push the event in the internal queue
            if (this.verboseLogging() || severity === LoggingSeverity.CRITICAL) {
                this.queue.push(message);
                this._messageCount++;
            }

            // When throttle limit reached, send a special event
            if (this._messageCount == this.MAX_INTERNAL_MESSAGE_LIMIT) {
                var throttleLimitMessage = "Internal events throttle limit per PageView reached for this app.";
                var throttleMessage = new _InternalLogMessage(_InternalMessageId.MessageLimitPerPVExceeded, throttleLimitMessage, false);

                this.queue.push(throttleMessage);
                this.warnToConsole(throttleLimitMessage);
            }
        }
    }

    /**
     * Indicates whether the internal events are throttled
     */
    private _areInternalMessagesThrottled(): boolean {
        return this._messageCount >= this.MAX_INTERNAL_MESSAGE_LIMIT;
    }
}
export {_InternalLogging as DiagnosticLogger};