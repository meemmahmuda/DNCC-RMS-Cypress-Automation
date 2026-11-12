const { defineConfig } = require("cypress");

module.exports = defineConfig({
  reporter: "cypress-mochawesome-reporter",

  reporterOptions: {
    charts: true,
    reportPageTitle: "DNCC RMS Automation Test Report",
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
    reportDir: "cypress/reports",
    overwrite: false,
    html: true,
    json: true
  },

  e2e: {
    baseUrl: "https://erevenue.dncc.gov.bd",

    defaultCommandTimeout: 30000,
    pageLoadTimeout: 60000,

    setupNodeEvents(on, config) {

      require("cypress-mochawesome-reporter/plugin")(on);

      on("task", {
        getCredentials() {
          return {
            username: process.env.CYPRESS_USERNAME,
            password: process.env.CYPRESS_PASSWORD,
            otp: process.env.CYPRESS_OTP || "070210"
          };
        }
      });

      return config;
    }
  }
});


// $env:CYPRESS_USERNAME="YOUR_USERNAME"
// $env:CYPRESS_PASSWORD="YOUR_PASSWORD"
// $env:CYPRESS_OTP="070210"   

// npx cypress open
// npx cypress run

// npx cypress run --headed --browser chrome