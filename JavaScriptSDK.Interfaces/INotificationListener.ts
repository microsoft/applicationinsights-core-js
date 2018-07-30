"use strict";

import { ITelemetryItem } from "./ITelemetryItem";

/**
 * An interface used for the notification listener.
 * @interface
 */
export interface INotificationListener {
    /**
     * [Optional] A function called when events are sent.
     * @param {ITelemetryItem[]} events - The array of events that have been sent.
     */
    eventsSent?: (events: ITelemetryItem[]) => void;
    /**
     * [Optional] A function called when events are dropped.
     * @param {ITelemetryItem[]} events - The array of events that have been dropped.
     * @param {number} reason           - The reason for dropping the events. The EventsDroppedReason
     * constant should be used to check the different values.
     */
    eventsDropped?: (events: ITelemetryItem[], reason: number) => void;
    /**
     * [Optional] A function called when events are rejected by the SDK.
     * @param {ITelemetryItem[]} events - The array of events that have been rejected.
     * @param {number} reason           - The reason for dropping the events. The EventsRejectedReason
     * constant should be used to check the different values.
     */
    eventsRejected?: (events: ITelemetryItem[], reason: number) => void;
}
