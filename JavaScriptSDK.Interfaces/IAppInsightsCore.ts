import { ITelemetryItem } from "./ITelemetryItem";
import { IChannelControls } from "./IChannelControls";
import { IPlugin } from "./ITelemetryPlugin";
import { IConfiguration } from "./IConfiguration";
import { INotificationListener } from "./INotificationListener";

"use strict";

export interface IAppInsightsCore {

    /*
    * Config object used to initialize AppInsights
    */
    config: IConfiguration;

    /*
    * Initialization queue. Contains functions to run when appInsights initializes
    */        
    initialize(config: IConfiguration, extensions: IPlugin[]): void;

    /*
    * Get transmission controls for controlling transmission behavior
    */
    getTransmissionControl(): IChannelControls;

    /*
    * Core track API
    */
    track(telemetryItem: ITelemetryItem): void;

    /**
     * Adds a notification listener. The SDK calls methods on the listener when an appropriate notification is raised.
     * @param {INotificationListener} listener - An INotificationListener object.
     */
    addNotificationListener(listener: INotificationListener): void;

    /**
     * Removes all instances of the listener.
     * @param {INotificationListener} listener - INotificationListener to remove.
     */
    removeNotificationListener(listener: INotificationListener): void;
}