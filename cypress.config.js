
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://erevenue.dncc.gov.bd",

    defaultCommandTimeout: 30000,
    pageLoadTimeout: 60000,

    setupNodeEvents(on, config) {

      on("task", {
        getCredentials() {
          return {
            username: process.env.CYPRESS_USERNAME,
            password: process.env.CYPRESS_PASSWORD
          };
        }
      });

      return config;
    }
  }
});
