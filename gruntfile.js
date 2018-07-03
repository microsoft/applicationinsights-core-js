module.exports = function (grunt) {
    grunt.initConfig({
        ts: {
            options: {
                comments: true
            },
            corecjs: {
                tsconfig: './cjs/tsconfigcommonjs.json',
                src: [
                    './JavaScriptSDK.Interfaces/IConfiguration.ts',
                    './JavaScriptSDK.Interfaces/IChannelControls.ts',
                    './JavaScriptSDK.Interfaces/ITelemetryPlugin.ts',
                    './JavaScriptSDK.Interfaces/ITelemetryItem.ts',
                    './JavaScriptSDK.Interfaces/IAppInsightsCore.ts',
                    './JavaScriptSDK.Interfaces/CoreUtils.ts',
                    './JavaScriptSDK/AppInsightsCore.ts',
                    './applicationinsights-core-js.ts'
                ]
            },
            core: {
                tsconfig: './tsconfig.json',
                src: [
                    './JavaScriptSDK.Interfaces/IConfiguration.ts',
                    './JavaScriptSDK.Interfaces/IChannelControls.ts',
                    './JavaScriptSDK.Interfaces/ITelemetryPlugin.ts',
                    './JavaScriptSDK.Interfaces/ITelemetryItem.ts',
                    './JavaScriptSDK.Interfaces/IAppInsightsCore.ts',
                    './JavaScriptSDK.Interfaces/CoreUtils.ts',
                    './JavaScriptSDK/AppInsightsCore.ts',
                    './applicationinsights-core-js.ts'
                ],
                out: './amd/bundle/applicationinsights-core-js.js',
            },
            types: {
                tsconfig: './tsconfig.json',
                src: [
                    'JavaScript/JavaScriptSDK.Tests/DefinitionTypes/*.ts'
                ],
                out: 'bundle/test/ai.types.js'
            },
            test: {
                tsconfig: './tsconfig.json',
                src: [
                    'JavaScript/JavaScriptSDK.Tests/Selenium/*.ts'
                ],
                out: 'JavaScript/JavaScriptSDK.Tests/Selenium/ai.tests.js'
            },
            testSchema: {
                tsconfig: './tsconfig.json',
                src: [
                    'JavaScript/JavaScriptSDK.Tests/Contracts/Generated/*.ts'
                ],
                out: 'bundle/test/ai.schema.tests.js'
            },
            coretest: {
                tsconfig: './tsconfig.json',
                src: [
                    './JavaScriptSDK.Tests/Selenium/ApplicationInsightsCore.Tests.ts',
		            './JavaScriptSDK.Tests/Selenium/aitests.ts'
                ],
                out: './JavaScriptSDK.Tests/Selenium/aicore.tests.js'
            }
        },
        uglify: {
            ai: {
                files: {
                    'bundle/ai.0.js': ['bundle/ai.js'],
                },
                options: {
                    sourceMap: true,
                    sourceMapIncludeSources: true,
                    sourceMapIn: 'bundle/ai.js.map',
                    compress: {
                        ie8: true
                    },
                    mangle: {
                        ie8: true
                    }
                },
            },
            snippet: {
                files: {
                    'bundle/snippet/snippet.min.js': ['JavaScript/JavaScriptSDK/snippet.js']
                }
            }
        },
        qunit: {
            core: {
                options: {
                    urls: [
                        './JavaScriptSDK.Tests/Selenium/Tests.html'                       
                    ],
                    timeout: 300 * 1000, // 5 min
                    console: false,
                    summaryOnly: true,
                    '--web-security': 'false'
                }
            }
        }
    });

    grunt.event.on('qunit.testStart', function (name) {
        grunt.log.ok('Running test: ' + name);
    });

    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.registerTask("core", ["ts:core"]);
    grunt.registerTask("corecjs", ["ts:corecjs"])
    grunt.registerTask("coretest", ["ts:core", "ts:coretest", "qunit:core"]);
};