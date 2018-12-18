var webdriver = require('selenium-webdriver')
var browsers = ['firefox', 'chrome'];
var pathToTests = undefined;
if (!pathToTests) {
    throw new Error('Specify path to Tests.html');
}

browsers.forEach(browser => {
    var driver = new webdriver.Builder()
    .forBrowser(browser)
    .build();

    // Navigate to test page
    driver.navigate().to(`${pathToTests}`)
        .then(function() {
            var didTestsPass = function() {
                var titlePromise = driver.getTitle();
                var retries = 0;
                titlePromise.then(function(title) {
                    if (title.includes('✖')) {
                        throw new Error('tests failed');
                    } else if (title.includes('✔')) {
                        console.log(`${browser}: Tests Passed`);
                        driver.quit();
                    } else {
                        if (retries < 5) {
                            setTimeout(didTestsPass, 5000);
                            retries++;
                        } else {
                            throw new Error('tests took too long');
                        }
                    }
                })
                .catch((error) => {
                    driver.quit();
                    throw error;
                });
            }
            setTimeout(didTestsPass, 1000);
        })
        .catch(function(error) {
            console.error('There was an error', error);
        });
});