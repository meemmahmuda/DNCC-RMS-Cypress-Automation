# DNCC RMS Automation Test Suite

End-to-end (E2E) UI automation tests for the **DNCC RMS** (Revenue Management System) web application, built with [Cypress](https://www.cypress.io/) and reported with [Mochawesome](https://github.com/adamgruber/mochawesome).

## Table of Contents

- [Overview](#overview)
- [Test Coverage](#test-coverage)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Tests](#running-the-tests)
- [Test Report](#test-report)
- [Latest Test Result](#latest-test-result)
- [Notes & Best Practices](#notes--best-practices)

---

## Overview

This project automates the smoke/regression checks of two major wings of the DNCC RMS portal:

1. **Holding Tax**
2. **Trade License**

Each test logs in through the real login flow (including OTP verification), lands on the module dashboard, and then walks through the sidebar menus and submenus to make sure every page loads correctly.

## Test Coverage

| Spec file | Module | What it verifies |
|-----------|--------|------------------|
| `cypress/e2e/dncc_holding_tax.cy.js` | Holding Tax | Login, OTP verification, dashboard load, all main menus and submenus, and page navigation for all menus |
| `cypress/e2e/dncc_trade_license.cy.js` | Trade License | Login, OTP verification, dashboard load, collects every sidebar link, detects duplicate links, visits **every submenu page**, detects broken/error pages and pages missing the sidebar, takes screenshots of broken pages, logout, and login-page verification |

### Common flow in both specs

1. Unlock the test user through the unlock endpoint
2. Open the login page and select the wing and section
3. Enter username and password
4. Verify the OTP page and submit the OTP
5. Verify the correct dashboard is reached
6. Verify and navigate through the sidebar menus and submenus

### Extra checks in the Trade License spec

- Expected number of main menus, total submenu links and pages to visit
- Duplicate link detection
- Error-page detection (server errors) with automatic screenshots
- All main menus stay expanded while navigating
- Logout and return-to-login verification

## Tech Stack

- **Cypress** - E2E test runner
- **Mocha** - test framework (bundled with Cypress)
- **Mochawesome** (`mochawesome`, `mochawesome-merge`, `mochawesome-report-generator`) - HTML/JSON reporting
- **JavaScript (Node.js)**

## Project Structure

```
.
├── cypress/
│   ├── e2e/
│   │   ├── dncc_holding_tax.cy.js
│   │   └── dncc_trade_license.cy.js
│   ├── fixtures/
│   ├── reports/            # Mochawesome JSON + merged HTML report
│   ├── screenshots/        # Auto-captured screenshots (broken pages / failures)
│   └── support/
├── cypress.config.js
├── package.json
├── .gitignore
└── README.md
```



## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- npm (comes with Node.js) or yarn
- A modern browser (Chrome / Edge / Electron)
- Network access to the DNCC RMS test environment

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/meemmahmuda/DNCC-RMS-Cypress-Automation.git
cd <DNCC-RMS-Cypress-Automation>

# 2. Install dependencies
npm install
```

## Running the Tests

**Open the Cypress Test Runner (interactive mode)**

```bash
npx cypress open
```

**Run all specs headless**

```bash
npx cypress run
```

**Run a single spec**

```bash
npx cypress run --spec "cypress/e2e/dncc_holding_tax.cy.js"
npx cypress run --spec "cypress/e2e/dncc_trade_license.cy.js"
```

**Run in a specific browser**

```bash
npx cypress run --browser chrome
```

## Test Report

Reports are generated with Mochawesome. After a run, merge the JSON files and generate the final HTML report:

```bash
# Merge all JSON reports into one
npx mochawesome-merge "cypress/reports/.jsons/*.json" > cypress/reports/merged.json

# Generate the HTML report
npx marge cypress/reports/merged.json --reportDir cypress/reports --inline --reportPageTitle "DNCC RMS Automation Test Report"
```

Open the generated report in your browser:

```
cypress/reports/merged.html   (or index.html, depending on your configuration)
```

The report includes pass/fail charts, test duration, test code, and embedded screenshots.

### Suggested `package.json` scripts

```json
"scripts": {
  "test": "cypress run",
  "test:holding": "cypress run --spec cypress/e2e/dncc_holding_tax.cy.js",
  "test:trade": "cypress run --spec cypress/e2e/dncc_trade_license.cy.js",
  "report:merge": "mochawesome-merge \"cypress/reports/.jsons/*.json\" > cypress/reports/merged.json",
  "report:html": "marge cypress/reports/merged.json --reportDir cypress/reports --inline",
  "report": "npm run report:merge && npm run report:html"
}
```

## Latest Test Result

| Metric | Value |
|--------|-------|
| Suites | 2 |
| Tests | 2 |
| Passed | 2 |
| Failed | 0 |
| Pending / Skipped | 0 |
| Pass rate | **100%** |
| Total duration | ~5 min 57 sec |
| Run date | 17 Nov 2026 |

| Test | Module | Duration | Status |
|------|--------|----------|--------|
| Login, verify OTP and test all dashboard menus and submenus | Holding Tax | ~5 min 5 sec | Passed |
| Login, verify OTP and test all dashboard menus and submenus | Trade License | ~50 sec | Passed |

The full interactive report is available in [`index.html`](./index.html) - download it and open it in a browser.

## Notes & Best Practices

- **Never commit real credentials or OTPs.** Keep them in `cypress.env.json` or CI secrets.
- Tests depend on the test environment's data, menu structure and availability. If menus are added or removed, update the expected counts in the specs.
- Run tests against the **test/staging** environment only, never production.
- Screenshots of broken pages are saved automatically to `cypress/screenshots/`.

## Author

**<Your Name>**
QA / Automation Engineer
GitHub: [@<your-username>](https://github.com/<your-username>)

---

*Built with Cypress and Mochawesome.*
