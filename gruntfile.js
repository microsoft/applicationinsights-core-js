module.exports = function (grunt) {
    grunt.initConfig({
        options: {
            force: true,
            dot: true // remove hidden files
        },
        // delete bundle dirs, compiled core test files, node_modules contents (keep dir)
        clean: {
            core: ['./amd/bundle/**', './JavaScriptSDK.Tests/Selenium/aicore.tests*', 'node_modules/*'],
            corecjs: ['./cjs/bundle/**', './JavaScriptSDK.Tests/Selenium/aicore.tests*', 'node_modules/*']
        },
        tslint: {
            options: {
                rulesDirectory: 'node_modules/tslint-microsoft-contrib',
            },
            files: {
                src: ['./**/*.ts', '!./**/node_modules/**/*.ts', '!./JavaScriptSDK.Tests/**/*.ts'],
            }
        },
        ts: {
            options: {
                comments: true
            },
            corecjs: {
                tsconfig: './cjs/tsconfigcommonjs.json',
                src: [
                    './JavaScriptSDK.Interfaces/*.ts',
                    './JavaScriptSDK/*.ts',
                    './applicationinsights-core-js.ts'
                ]
            },
            core: {
                tsconfig: './tsconfig.json',
                src: [
                    './JavaScriptSDK.Interfaces/*.ts',
                    './JavaScriptSDK/*.ts',
                    './applicationinsights-core-js.ts'
                ]
            },
            coretest: {
                tsconfig: './JavaScriptSDK.Tests/tsconfig.json',
                src: [
                    './JavaScriptSDK.Tests/Selenium/ApplicationInsightsCore.Tests.ts',
                    './JavaScriptSDK.Tests/Selenium/aitests.ts'
                ],
                out: './JavaScriptSDK.Tests/Selenium/aicore.tests.js'
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

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-tslint');
    grunt.registerTask("core", ["ts:core"]);
    grunt.registerTask("corecjs", ["ts:corecjs"])
    grunt.registerTask("coretest", ["ts:core", "ts:coretest", "qunit:core"]);
};