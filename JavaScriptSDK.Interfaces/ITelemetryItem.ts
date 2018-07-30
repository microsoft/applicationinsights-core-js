"use strict";

/**
 * Telemety item supported in Core
 */
export interface ITelemetryItem {
    /**
     * Unique name of the telemetry item
     */ 
    name: string;

    /**
     * Timestamp when item was sent
     */ 
    timestamp: Date;

    /**
     * Identifier of the resource that uniquely identifies which resource data is sent to
     */ 
    instrumentationKey: string;

    /**
     * System context properties of the telemetry item, example: ip address, city etc
     */ 
    ctx?: {[key: string]: any};

    tags?: Tags[];

    data?: {
        [key: string]: any;
    },

    /**
     * Telemetry type used for part B
     */
    baseType?: string;

    /**
     * Based on schema for part B
     */ 
    baseData?: { [key: string]: any };

}

export interface Tags {
    [key: string]: any;
}