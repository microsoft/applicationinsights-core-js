/// <reference path="../TestFramework/Common.ts" />
/// <reference path="../../JavaScriptSDK/AppInsightsCore.ts" />
/// <reference path="../../applicationinsights-core-js.ts" />

import { IConfiguration, ITelemetryPlugin, ITelemetryItem, IPlugin } from "../../applicationinsights-core-js"
import { AppInsightsCore } from "../../JavaScriptSDK/AppInsightsCore";
import { IChannelControls } from "../../JavaScriptSDK.Interfaces/IChannelControls";
import { _InternalMessageId, LoggingSeverity } from "../../JavaScriptSDK.Enums/LoggingEnums";
import { _InternalLogMessage } from "../../JavaScriptSDK/DiagnosticLogger";

export class ApplicationInsightsCoreTests extends TestClass {

    public testInitialize() {
        super.testInitialize();
    }

    public testCleanup() {
        super.testCleanup();
    }

    public registerTests() {

        this.testCase({
            name: "ApplicationInsightsCore: Initialization validates input",
            test: () => {

                let samplingPlugin = new TestSamplingPlugin();
                                
                let appInsightsCore = new AppInsightsCore();
                try {                    
                    appInsightsCore.initialize(null, [samplingPlugin]);
                } catch (error) {
                    Assert.ok(true, "Validates configuration");                    
                }

                let config2 : IConfiguration = {
                        endpointUrl: "https://dc.services.visualstudio.com/v2/track",
                        instrumentationKey: "40ed4f60-2a2f-4f94-a617-22b20a520864",
                        extensionConfig: {}
                };

                try {                    
                    appInsightsCore.initialize(config2, null);
                } catch (error) {
                    Assert.ok(true, "Validates extensions are provided");                    
                }
                let config : IConfiguration = {
                    endpointUrl: "https://dc.services.visualstudio.com/v2/track",
                    instrumentationKey: "",
                    extensionConfig: {}
                };
                try {                    
                    appInsightsCore.initialize(config, [samplingPlugin]);
                } catch (error) {
                    Assert.ok(true, "Validates instrumentationKey");
                }
            }
        });

        this.testCase({
            name: "ApplicationInsightsCore: Initialization initializes setNextPlugin",
            test: () => {
                let samplingPlugin = new TestSamplingPlugin();
                samplingPlugin.priority = 20;

                let channelPlugin = new ChannelPlugin();
                channelPlugin.priority = 120;
                // Assert prior to initialize
                Assert.ok(!samplingPlugin.nexttPlugin, "Not setup prior to pipeline initialization");

                let appInsightsCore = new AppInsightsCore();
                appInsightsCore.initialize(
                    {instrumentationKey: "09465199-12AA-4124-817F-544738CC7C41"}, 
                    [samplingPlugin, channelPlugin]);
                Assert.ok(!!samplingPlugin.nexttPlugin, "setup prior to pipeline initialization");
            }
        });


        this.testCase({
            name: "ApplicationInsightsCore: Plugins cannot be added with same priority",
            test: () => {
                let samplingPlugin = new TestSamplingPlugin();
                samplingPlugin.priority = 20;

                let samplingPlugin1 = new TestSamplingPlugin();
                samplingPlugin1.priority = 20;

                let channelPlugin = new ChannelPlugin();
                channelPlugin.priority = 120;

                let appInsightsCore = new AppInsightsCore();
                try {
                appInsightsCore.initialize(
                    {instrumentationKey: "09465199-12AA-4124-817F-544738CC7C41"}, 
                    [samplingPlugin, samplingPlugin1, channelPlugin]);
                } catch (error) {
                    Assert.ok(error.message.indexOf("priority") >= 0, "Priority cannot be the same");
                }
            }
        });

        this.testCase({
            name: "ApplicationInsightsCore: flush clears channel buffer",
            test: () => {
                let channelPlugin = new ChannelPlugin();
                let appInsightsCore = new AppInsightsCore();
                appInsightsCore.initialize(
                    {instrumentationKey: "09465199-12AA-4124-817F-544738CC7C41"}, 
                    [channelPlugin]);
                
                Assert.ok(!channelPlugin.isFlushInvoked, "Flush not called on initialize");
                appInsightsCore.getTransmissionControl().flush(true);

                Assert.ok(channelPlugin.isFlushInvoked, "Flush triggered for channel");
            }
        });

        this.testCase({
            name: "DiagnosticLogger: Critical logging history is saved",
            test: () => {
                // Setup
                const channelPlugin = new ChannelPlugin();
                const appInsightsCore = new AppInsightsCore();
                appInsightsCore.initialize({instrumentationKey: "09465199-12AA-4124-817F-544738CC7C41"}, [channelPlugin]);

                const messageId: _InternalMessageId = _InternalMessageId.CannotAccessCookie; // can be any id
                const messageKey = appInsightsCore.logger['AIInternalMessagePrefix'] + messageId;

                // Test precondition
                Assert.ok(appInsightsCore.logger['_messageCount'] === 0, 'PRE: No internal logging performed yet');
                Assert.ok(!appInsightsCore.logger['_messageLogged'][messageKey], "PRE: messageId not yet logged");

                // Act
                appInsightsCore.logger.throwInternal(LoggingSeverity.CRITICAL, messageId, "Test Error");

                // Test postcondition
                Assert.ok(appInsightsCore.logger['_messageCount'] === 1, 'POST: Logging success');
                Assert.ok(appInsightsCore.logger['_messageLogged'][messageKey], "POST: Correct messageId logged");
            }
        });

        // TODO: test no reinitialization
        this.testCase({
            name: "Initialize: core cannot be reinitialized",
            test: () => {
                // Setup
                const channelPlugin = new ChannelPlugin();
                const appInsightsCore = new AppInsightsCore();
                const initFunction = () => appInsightsCore.initialize({instrumentationKey: "09465199-12AA-4124-817F-544738CC7C41"}, [channelPlugin]);

                // Assert precondition
                Assert.ok(!appInsightsCore["_isInitialized"], "PRE: core constructed but not initialized");

                // Init
                initFunction();

                // Assert initialized
                Assert.ok(appInsightsCore["_isInitialized"], "core is initialized");

                Assert.throws(initFunction, Error, "Core cannot be reinitialized");
            }
        });

        // TODO: test pollInternalLogs
        this.testCase({
            name: "DiagnosticLogger: Logs can be polled",
            test: () => {
                // Setup
                const channelPlugin = new ChannelPlugin();
                const appInsightsCore = new AppInsightsCore();
                appInsightsCore.initialize(
                    {
                        instrumentationKey: "09465199-12AA-4124-817F-544738CC7C41",
                        diagnosticLoggingInterval: 1
                    }, [channelPlugin]);
                const trackTraceSpy = this.sandbox.stub(appInsightsCore, "track");

                Assert.equal(0 ,appInsightsCore.logger.queue.length, "Queue is empty");

                // Setup queue
                const queue: Array<_InternalLogMessage> = appInsightsCore.logger.queue;
                queue.push(new _InternalLogMessage(1, "Hello1"));
                queue.push(new _InternalLogMessage(2, "Hello2"));
                const poller = appInsightsCore.pollInternalLogs();

                // Assert precondition
                Assert.equal(2, appInsightsCore.logger.queue.length, "Queue contains 2 items");

                // Act
                this.clock.tick(1);

                // Assert postcondition
                Assert.equal(0 ,appInsightsCore.logger.queue.length, "Queue is empty");

                const data1 = trackTraceSpy.args[0][0];
                Assert.ok(data1.baseData.message.indexOf("Hello1") !== -1);

                const data2 = trackTraceSpy.args[1][0];
                Assert.ok(data2.baseData.message.indexOf("Hello2") !== -1);

                // Cleanup
                clearInterval(poller);
            }
        });

        // TODO: test logger crosscontamination
        this.testCase({
            name: "DiagnosticLogger: Logs in separate cores do not interfere",
            test: () => {
                // Setup
                const channelPlugin = new ChannelPlugin();
                const appInsightsCore = new AppInsightsCore();
                appInsightsCore.initialize(
                    {
                        instrumentationKey: "09465199-12AA-4124-817F-544738CC7C41"
                    }, [channelPlugin]
                );
                const dummyCore = new AppInsightsCore();
                dummyCore.initialize(
                    {
                        instrumentationKey: "09465199-12AA-4124-817F-544738CC7C41"
                    }, [channelPlugin]
                );

                const messageId: _InternalMessageId = _InternalMessageId.CannotAccessCookie; // can be any id
                const messageKey = appInsightsCore.logger['AIInternalMessagePrefix'] + messageId;

                // Test precondition
                Assert.equal(0, appInsightsCore.logger['_messageCount'], 'PRE: No internal logging performed yet');
                Assert.ok(!appInsightsCore.logger['_messageLogged'][messageKey], "PRE: messageId not yet logged");
                Assert.equal(0, dummyCore.logger['_messageCount'], 'PRE: No dummy logging');
                Assert.ok(!dummyCore.logger['_messageLogged'][messageKey], "PRE: No dummy messageId logged");

                // Act
                appInsightsCore.logger.throwInternal(LoggingSeverity.CRITICAL, messageId, "Test Error");

                // Test postcondition
                Assert.equal(1, appInsightsCore.logger['_messageCount'], 'POST: Logging success');
                Assert.ok(appInsightsCore.logger['_messageLogged'][messageKey], "POST: Correct messageId logged");
                Assert.equal(0, dummyCore.logger['_messageCount'], 'POST: No dummy logging');
                Assert.ok(!dummyCore.logger['_messageLogged'][messageKey], "POST: No dummy messageId logged");
            }
        });

        this.testCase({
            name: "ApplicationInsightsCore: Plugins can be provided through configuration",
            test: () => {
                let samplingPlugin = new TestSamplingPlugin();
                samplingPlugin.priority = 20;

                let channelPlugin = new ChannelPlugin();
                channelPlugin.priority = 120;

                let appInsightsCore = new AppInsightsCore();
                try {
                appInsightsCore.initialize(
                    {instrumentationKey: "09465199-12AA-4124-817F-544738CC7C41", extensions: [samplingPlugin]},
                    [channelPlugin]);
                } catch (error) {
                    Assert.ok(false, "No error expected");
                }

                Assert.ok((<any>appInsightsCore)._extensions.length === 2, "Extensions can be provided through overall configuration");
            }
        });

        this.testCase({
            name: "ApplicationInsightsCore: Non telemetry specific plugins are initialized and not part of telemetry processing pipeline",
            test: () => {
                let samplingPlugin = new TestSamplingPlugin();
                samplingPlugin.priority = 20;

                let testPlugin = new TestPlugin();

                let channelPlugin = new ChannelPlugin();
                channelPlugin.priority = 120;

                let appInsightsCore = new AppInsightsCore();
                try {
                appInsightsCore.initialize(
                    {instrumentationKey: "09465199-12AA-4124-817F-544738CC7C41"},
                    [testPlugin, samplingPlugin, channelPlugin]);
                } catch (error) {
                    Assert.ok(false, "Exception not expected");
                }

                Assert.ok(typeof ((<any>appInsightsCore)._extensions[0].processTelemetry) !== 'function', "Extensions can be provided through overall configuration");
            }
        });
    }
}

class TestSamplingPlugin implements ITelemetryPlugin {
    public processTelemetry: (env: ITelemetryItem) => void;
    public initialize: (config: IConfiguration) => void;
    public identifier: string = "AzureSamplingPlugin";
    public setNextPlugin: (next: ITelemetryPlugin) => void;
    public priority: number = 5;
    private samplingPercentage;
    public nexttPlugin: ITelemetryPlugin;


    constructor() {
        this.processTelemetry = this._processTelemetry.bind(this);
        this.initialize = this._start.bind(this);
        this.setNextPlugin = this._setNextPlugin.bind(this);
    }

    private _processTelemetry(env: ITelemetryItem) {
        if (!env) {
            throw Error("Invalid telemetry object");
        }
    }

    private _start(config: IConfiguration) {
        if (!config) {
            throw Error("required configuration missing");            
        }

        let pluginConfig = config.extensions ? config.extensions[this.identifier] : null;
        this.samplingPercentage = pluginConfig? pluginConfig.samplingPercentage : 100;
    }

    private _setNextPlugin(next: ITelemetryPlugin) : void {
        this.nexttPlugin = next;
    }
}

class ChannelPlugin implements IChannelControls {

    public isFlushInvoked = false;
    public isTearDownInvoked = false;
    public isResumeInvoked = false;
    public isPauseInvoked = false;

    constructor() {
        this.processTelemetry = this._processTelemetry.bind(this);
    }
    public pause(): void {
        this.isPauseInvoked = true;
    }    
    
    public resume(): void {
        this.isResumeInvoked = true;
    }

    public teardown(): void {
        this.isTearDownInvoked = true;
    }

    flush(async?: boolean, callBack?: () => void): void {
        this.isFlushInvoked = true;
        if (callBack) {
            callBack();
        }
    }

    public processTelemetry;

    public identifier = "Sender";
    
    setNextPlugin: (next: ITelemetryPlugin) => {
    }

    public priority: number = 101;

    public initialize = (config: IConfiguration) => {
    }

    private _processTelemetry(env: ITelemetryItem) {

    }
}

class TestPlugin implements IPlugin {
    private _config: IConfiguration;

    public initialize(config: IConfiguration) {
        this._config = config;
        // do custom one time initialization
    }

}