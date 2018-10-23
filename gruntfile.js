module.exports = function (grunt) {
    grunt.initConfig({
        options: {
            force: true,
            dot: true // remove hidden files
        },
        // delete bundle dirs, compiled core test files, node_modules contents (keep dir)
        clean: {
            core: ['./src/JavaScriptSDK.Tests/Selenium/aicore.tests*', 'node_modules/*', 'dist-esm', 'browser']
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
            core: {
                tsconfig: './tsconfig.json'
            },
            coretest: {
                tsconfig: './src/JavaScriptSDK.Tests/tsconfig.json',
                src: [
                    './src/JavaScriptSDK.Tests/Selenium/ApplicationInsightsCore.Tests.ts',
                    './src/JavaScriptSDK.Tests/Selenium/aitests.ts'
                ],
                out: './src/JavaScriptSDK.Tests/Selenium/aicore.tests.js'
            }
        },
        qunit: {
            core: {
                options: {
                    urls: [
                        './src/JavaScriptSDK.Tests/Selenium/Tests.html'
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