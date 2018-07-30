import { ITelemetryItem } from "../JavaScriptSDK.Interfaces/ITelemetryItem";
import { INotificationListener } from "../JavaScriptSDK.Interfaces/INotificationListener";

/**
 * Class to manage sending notifications to all the listeners.
 */
export class NotificationManager {
    listeners: INotificationListener[] = [];

    /**
     * Adds a notification listener.
     * @param {INotificationListener} listener - The notification listener to be added.
     */
    addNotificationListener(listener: INotificationListener): void {
        this.listeners.push(listener);
    }

    /**
     * Removes all instances of the listener.
     * @param {INotificationListener} listener - AWTNotificationListener to remove.
     */
    removeNotificationListener(listener: INotificationListener): void {
        let index: number = this.listeners.indexOf(listener);
        while (index > -1) {
            this.listeners.splice(index, 1);
            index = this.listeners.indexOf(listener);
        }
    }

    /**
     * Notification for events sent.
     * @param {ITelemetryItem[]} events - The array of events that have been sent.
     */
    eventsSent(events: ITelemetryItem[]): void {
        for (let i: number = 0; i < this.listeners.length; ++i) {
            if (this.listeners[i].eventsSent) {
                setTimeout(() => this.listeners[i].eventsSent(events), 0);
            }
        }
    }

    /**
     * Notification for events being dropped.
     * @param {ITelemetryItem[]} events - The array of events that have been dropped.
     * @param {number} reason             - The reason for which the SDK dropped the events. The EventsDroppedReason
     * constant should be used to check the different values.
     */
    eventsDropped(events: ITelemetryItem[], reason: number): void {
        for (let i: number = 0; i < this.listeners.length; ++i) {
            if (this.listeners[i].eventsDropped) {
                setTimeout(() => this.listeners[i].eventsDropped(events, reason), 0);
            }
        }
    }

    /**
     * Notification for events being rejected.
     * @param {ITelemetryItem[]} events - The array of events that have been rejected.
     * @param {number} reason             - The reason for which the SDK rejeceted the events. The EventsRejectedReason
     * constant should be used to check the different values.
     */
    eventsRejected(events: ITelemetryItem[], reason: number): void {
        for (let i: number = 0; i < this.listeners.length; ++i) {
            if (this.listeners[i].eventsRejected) {
                setTimeout(() => this.listeners[i].eventsRejected(events, reason), 0);
            }
        }
    }
}
