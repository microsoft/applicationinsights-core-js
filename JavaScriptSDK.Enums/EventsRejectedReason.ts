/**
 * The EventsRejectedReason enumeration contains a set of values that specify the reason for rejecting an event.
 */
export const EventsRejectedReason = {
    /**
     * The event is invalid.
     */
    InvalidEvent: 1,
    /**
     * The size of the event is too large.
     */
    SizeLimitExceeded: 2,
    /**
     * The server is not accepting events from this instrumentation key.
     */
    KillSwitch: 3
};
