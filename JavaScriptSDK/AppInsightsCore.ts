import { IAppInsightsCore } from "../JavaScriptSDK.Interfaces/IAppInsightsCore"
import { IConfiguration } from "../JavaScriptSDK.Interfaces/IConfiguration";
import { ITelemetryPlugin, IPlugin } from "../JavaScriptSDK.Interfaces/ITelemetryPlugin";
import { IChannelControls, MinChannelPriorty } from "../JavaScriptSDK.Interfaces/IChannelControls";
import { ITelemetryItem } from "../JavaScriptSDK.Interfaces/ITelemetryItem";
import { INotificationListener } from "../JavaScriptSDK.Interfaces/INotificationListener";
import { EventsDiscardedReason } from "../JavaScriptSDK.Enums/EventsDiscardedReason";
import { CoreUtils } from "./CoreUtils";
import { NotificationManager } from "./NotificationManager";
import { IDiagnosticLogger } from "../JavaScriptSDK.Interfaces/IDiagnosticLogger";
import { _InternalLogMessage, DiagnosticLogger } from "./DiagnosticLogger";
import { _InternalMessageId } from "../JavaScriptSDK.Enums/LoggingEnums";

"use strict";

export class AppInsightsCore implements IAppInsightsCore {

    public config: IConfiguration;
    public static defaultConfig: IConfiguration;
    public logger: IDiagnosticLogger;

    private _extensions: Array<IPlugin>;
    private _notificationManager: NotificationManager;
    private _isInitialized: boolean = false;
    private _channelController: ChannelController;

    constructor() {
        this._extensions = new Array<IPlugin>();
        this._channelController = new ChannelController();
    }

    initialize(config: IConfiguration, extensions: IPlugin[]): void {

        // Make sure core is only initialized once
        if (this._isInitialized) {
            throw Error("Core should not be initialized more than once");
        }

        if (!extensions || extensions.length === 0) {
            // throw error
            throw Error("At least one extension channel is required");
        }

        if (!config || CoreUtils.isNullOrUndefined(config.instrumentationKey)) {
            throw Error("Please provide instrumentation key");
        }

        this.config = config;

        this._notificationManager = new NotificationManager();
        this.config.extensions = CoreUtils.isNullOrUndefined(this.config.extensions) ? [] : this.config.extensions;
        
        // add notification to the extensions in the config so other plugins can access it
        this.config.extensionConfig = CoreUtils.isNullOrUndefined(this.config.extensionConfig) ? {} : this.config.extensionConfig;
        this.config.extensionConfig.NotificationManager = this._notificationManager;

        this.logger = new DiagnosticLogger(config);

        // Initial validation
        extensions.forEach((extension: ITelemetryPlugin) => {
            if (CoreUtils.isNullOrUndefined(extension.initialize)) {
                throw Error(validationError);
            }
        });

        if (this.config.extensions.length > 0) {
            let isValid = true;
            this.config.extensions.forEach(item =>
            {
                if (CoreUtils.isNullOrUndefined(item)) {
                    isValid = false;
                }   
            });

            if (!isValid) {
                throw Error(validationError);
            }
        }        

        this._extensions = extensions.concat(this.config.extensions).sort((a, b) => {
            let extA = (<ITelemetryPlugin>a);
            let extB = (<ITelemetryPlugin>b);
            let typeExtA = typeof extA.processTelemetry;
            let typeExtB = typeof extB.processTelemetry;
            if (typeExtA === 'function' && typeExtB === 'function') {
                return extA.priority - extB.priority;
            }

            if (typeExtA === 'function' && typeExtB !== 'function') {
                // keep non telemetryplugin specific extensions at start
                return 1;
            }

            if (typeExtA !== 'function' && typeExtB === 'function') {
                return -1;
            }
        });

        this._extensions.push(this._channelController);

        // Check if any two extensions have the same priority, then throw error
        let priority = {};
        this._extensions.forEach(ext => {
            let t = (<ITelemetryPlugin>ext);
            if (t && t.priority) {
                if (priority[t.priority]) {
                    throw new Error(duplicatePriority);
                } else {
                    priority[t.priority] = 1; // set a value
                }
            }
        });


        this._extensions.forEach(ext => ext.initialize(this.config, this, this._extensions)); // initialize

        // Set next plugin for all but last extension
        for (let idx = 0; idx < this._extensions.length - 1; idx++) {
            if (this._extensions[idx] && typeof (<any>this._extensions[idx]).processTelemetry !== 'function') {
                // these are initialized only, allowing an entry point for extensions to be initialized when SDK initializes
                continue;
            }

            (<any>this._extensions[idx]).setNextPlugin(this._extensions[idx + 1]); // set next plugin
        }


        if (this.getTransmissionControls().length === 0) {
            throw new Error("No channels available");
        }
        this._isInitialized = true;
    }

    getTransmissionControls(): Array<IChannelControls[]> {
       return this._channelController.ChannelControls;
    }

    track(telemetryItem: ITelemetryItem) {
        if (telemetryItem === null) {
            this._notifiyInvalidEvent(telemetryItem);
            // throw error
            throw Error("Invalid telemetry item");
        }

        if (telemetryItem.baseData && !telemetryItem.baseType) {
            this._notifiyInvalidEvent(telemetryItem);
            throw Error("Provide data.baseType for data.baseData");
        }
        
        if (!telemetryItem.baseType) {
            // Hard coded from Common::Event.ts::Event.dataType
            telemetryItem.baseType = "EventData";
        }

        if (!telemetryItem.instrumentationKey) {
            // setup default ikey if not passed in
            telemetryItem.instrumentationKey = this.config.instrumentationKey;
        }
        if (!telemetryItem.timestamp) {
            // add default timestamp if not passed in
            telemetryItem.timestamp = new Date();
        }
 
        // do basic validation before sending it through the pipeline
        this._validateTelmetryItem(telemetryItem);

        // invoke any common telemetry processors before sending through pipeline
        let i = 0;
        while (i < this._extensions.length) {
            if ((<any>this._extensions[i]).processTelemetry) {
                (<any>this._extensions[i]).processTelemetry(telemetryItem); // pass on to first extension that can support processing
                break;
            }

            i++;
        }
    }

    /**
     * Adds a notification listener. The SDK calls methods on the listener when an appropriate notification is raised.
     * The added plugins must raise notifications. If the plugins do not implement the notifications, then no methods will be
     * called.
     * @param {INotificationListener} listener - An INotificationListener object.
     */
    addNotificationListener(listener: INotificationListener): void {
        this._notificationManager.addNotificationListener(listener);
    }

    /**
     * Removes all instances of the listener.
     * @param {INotificationListener} listener - INotificationListener to remove.
     */
    removeNotificationListener(listener: INotificationListener): void {
        this._notificationManager.removeNotificationListener(listener);
    }
    
    /**
     * Periodically check logger.queue for 
     */
    pollInternalLogs(): number {
        if (!(this.config.diagnosticLoggingInterval > 0)) {
            throw Error("config.diagnosticLoggingInterval must be a positive integer");
        }

        return setInterval(() => {
            const queue: Array<_InternalLogMessage> = this.logger.queue;

            queue.forEach((logMessage: _InternalLogMessage) => {
                const item: ITelemetryItem = {
                    name: "InternalMessageId: " + logMessage.messageId,
                    instrumentationKey: this.config.instrumentationKey,
                    timestamp: new Date(),
                    baseType: _InternalLogMessage.dataType,
                    baseData: { message: logMessage.message }
                };

                this.track(item);
            });
            queue.length = 0;
        }, this.config.diagnosticLoggingInterval);
    }

    private _validateTelmetryItem(telemetryItem: ITelemetryItem) {

        if (CoreUtils.isNullOrUndefined(telemetryItem.name)) {
            this._notifiyInvalidEvent(telemetryItem);
            throw Error("telemetry name required");
        }

        if (CoreUtils.isNullOrUndefined(telemetryItem.timestamp)) {
            this._notifiyInvalidEvent(telemetryItem);
            throw Error("telemetry timestamp required");
        }

        if (CoreUtils.isNullOrUndefined(telemetryItem.instrumentationKey)) {
            this._notifiyInvalidEvent(telemetryItem);
            throw Error("telemetry instrumentationKey required");
        }
    }

    private _notifiyInvalidEvent(telemetryItem: ITelemetryItem): void {
        this._notificationManager.eventsDiscarded([telemetryItem], EventsDiscardedReason.InvalidEvent);
    }
}

class ChannelController implements ITelemetryPlugin {

    private channelQueue: Array<IChannelControls[]>;
    
    public processTelemetry (item: ITelemetryItem) {
        this.channelQueue.forEach(queues => {
            // pass on to first item in queue
            queues[0].processTelemetry(item);
        });
    }

    public get ChannelControls(): Array<IChannelControls[]> {
        return this.channelQueue;
    }

    identifier: string = "ChannelControllerPlugin";

    setNextPlugin: (next: ITelemetryPlugin) => {};

    priority: number = 200; // in reserved range 100 to 200

    initialize(config: IConfiguration, core: IAppInsightsCore, extensions: IPlugin[]) {
        this.channelQueue = new Array<IChannelControls[]>();
        if (config.channels) {
            config.channels.forEach(queue => {
                this.channelQueue.push(queue);
            });
        } else {
            let arr = new Array<IChannelControls>();
            extensions.forEach(ext => {
                let e = <IChannelControls>ext;
                if (e && e.priority > 200) {
                    arr.push(e);
                }
            });

            if (arr.length > 0) {
                // sort if not sorted
                arr = arr.sort((a,b) => {
                    return a.priority - b.priority;
                });
                
                this.channelQueue.push(arr);
            }
        }
    }
}

const validationError = "Extensions must provide callback to initialize";    
const duplicatePriority = "One or more extensions are set at same priority";
