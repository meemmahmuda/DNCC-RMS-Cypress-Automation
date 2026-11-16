// ======================================================
// IGNORE KNOWN APPLICATION JAVASCRIPT ERRORS
// ======================================================

let currentPageUrl = "";

const cascadingBugPages = new Set();

Cypress.on("uncaught:exception", (err) => {

    if (
        err.message.includes("Maximum call stack size exceeded") &&
        (err.stack || "").includes("CascadingDropDownBehavior")
    ) {

        cascadingBugPages.add(currentPageUrl || "(unknown page)");

        console.error(
            "KNOWN APP BUG (CascadingDropDown recursion) on " +
            currentPageUrl + ":",
            err.message
        );

        return false;
    }

    const ignoredErrors = [
        "jQuery is not defined",
        "$ is not defined",
        "$ is not a function",
        "Cannot read properties of null (reading 'style')",
        "Unexpected token 'this'",
        "Script error"
    ];

    if (ignoredErrors.some((message) => err.message.includes(message))) {

        console.error("Application JavaScript Error:", err.message);

        return false;
    }

});


// ======================================================
// EXPECTED MENU COUNTS
// ======================================================

const EXPECTED_MAIN_MENUS = 7;

const EXPECTED_TOTAL_LINKS = 47;

const EXPECTED_UNIQUE_PAGES = 47;

const VISIT_DUPLICATE_LINKS = true;

const EXPECTED_PAGES_TO_VISIT = VISIT_DUPLICATE_LINKS
    ? EXPECTED_TOTAL_LINKS
    : EXPECTED_UNIQUE_PAGES;


// ======================================================
// CORRECT URLS FOR THE 2 COLLECTION REPORT MENUS
// ======================================================

const DUE_PAID_PAGE_KEY = "rpt_tl_due_paid_status";

const APPL_REPORT_URL =
    "https://erevenue.dncc.gov.bd/newv/TradeLicense/rpt_TL_Due_paid_status?applicationtype=APPL";

const RENEW_REPORT_URL =
    "https://erevenue.dncc.gov.bd/newv/TradeLicense/rpt_TL_Due_paid_status?applicationtype=RENEW";

let dueStatusLinkCount = 0;


// ======================================================
// EXCLUDED URLS
// THESE 3 PAGES WILL NOT BE TESTED
// ======================================================

const EXCLUDED_URLS = [
    "/newv/tradelicense/tl_applicationsearchforpayment",
    "/newv/tradelicense/tl_applicationsearchforpayment_renewal",
    "/newv/tradelicense/tl_paymentforbusinessupdate"
];


// ======================================================
// HELPER: CHECK EXCLUDED URL
// ======================================================

const isExcludedPageUrl = (url) => {

    try {

        const parsedUrl = new URL(url);

        let pathname = parsedUrl.pathname
            .toLowerCase()
            .replace(/\/+$/, "")
            .replace(/\.aspx$/, "");

        return EXCLUDED_URLS.some((excludedUrl) => {

            return pathname === excludedUrl;
        });

    } catch (error) {

        return false;
    }
};


// ======================================================
// ERROR PAGE PATTERNS
// ======================================================

const ERROR_PAGE_PATTERNS = [
    "Server Error",
    "File or directory not found",
    "Runtime Error",
    "HTTP Error 404",
    "HTTP Error 500"
];


// ======================================================
// HELPER: KEEP ALL MAIN MENUS EXPANDED
// ======================================================

const expandAllMainMenus = () => {

    cy.get(".sidebar-nav", { timeout: 30000 }).should("be.visible");

    cy.get(".sidebar-nav").then(($sidebar) => {

        const sidebar = $sidebar[0];

        const submenus = sidebar.querySelectorAll("ul.nav-submenu");

        submenus.forEach((submenu) => {

            submenu.style.setProperty("display", "block", "important");
            submenu.style.setProperty("visibility", "visible", "important");
            submenu.style.setProperty("height", "auto", "important");
            submenu.style.setProperty("max-height", "none", "important");
            submenu.style.setProperty("opacity", "1", "important");

            const parentMenu = submenu.closest("li.nav-item");

            if (parentMenu) {

                parentMenu.classList.add("menu-open");

                const toggle = parentMenu.querySelector("a.has-submenu-toggle");

                if (toggle) {
                    toggle.setAttribute("aria-expanded", "true");
                }
            }
        });

        cy.log("All Submenus Expanded: " + submenus.length);
    });
};


// ======================================================
// MAIN TEST SUITE
// ======================================================

describe("DNCC RMS Trade License - Complete Login & Dashboard Menu Testing", () => {

    let credentials;

    before(() => {

        cy.task("getCredentials").then((data) => {

            credentials = data;

            expect(credentials.username).to.be.a("string").and.not.empty;
            expect(credentials.password).to.be.a("string").and.not.empty;
        });
    });


    it("Login, verify OTP and test all dashboard menus and submenus", () => {

        let mainMenus = [];
        let submenuPages = [];
        let duplicateLinks = [];
        let totalLinks = 0;
        let brokenPages = [];
        let noSidebarPages = [];
        let logoutUrl = "";
        let dashboardUrl = "";

        dueStatusLinkCount = 0;


        // ==================================================
        // STEP 1: UNLOCK USER
        // ==================================================

        cy.log("STEP 1: Unlocking User");

        cy.request({
            method: "GET",
            url: "/web/userulocknew.aspx",
            qs: { cuserid: credentials.username }
        }).then((response) => {

            expect(response.status).to.eq(200);

            cy.log("User unlocked successfully");
        });


        // ==================================================
        // STEP 2: OPEN LOGIN PAGE
        // ==================================================

        cy.log("STEP 2: Opening Login Page");

        cy.visit("/newv/Default");


        // ==================================================
        // STEP 3: SELECT WING
        // ==================================================

        cy.log("STEP 3: Selecting Trade License Wing");

        cy.get('select[name="ddType"]')
            .should("be.visible")
            .select("b");


        // ==================================================
        // STEP 4: SELECT SECTION
        // ==================================================

        cy.log("STEP 4: Selecting Trade License Section");

        cy.get('select[name="ddlGender"]', { timeout: 30000 })
            .should("be.visible");

        cy.get('select[name="ddlGender"]').select("3");


        // ==================================================
        // STEP 5: ENTER USERNAME
        // ==================================================

        cy.log("STEP 5: Entering Username");

        cy.get('input[name="txtLogin"]')
            .should("be.visible")
            .clear()
            .type(credentials.username);


        // ==================================================
        // STEP 6: ENTER PASSWORD
        // ==================================================

        cy.log("STEP 6: Entering Password");

        cy.get('input[name="txtPwd"]')
            .should("be.visible")
            .clear()
            .type(credentials.password, { log: false });


        // ==================================================
        // STEP 7: LOGIN
        // ==================================================

        cy.log("STEP 7: Submitting Login");

        cy.get('input[name="btnSubmit"]')
            .should("be.visible")
            .click();


        // ==================================================
        // STEP 8: VERIFY OTP PAGE
        // ==================================================

        cy.log("STEP 8: Verifying OTP Page");

        cy.location("pathname", { timeout: 60000 })
            .should("include", "otpverification");

        cy.log("OTP page reached");


        // ==================================================
        // STEP 9: ENTER FIXED OTP
        // ==================================================

        cy.log("STEP 9: Entering OTP");

        const otp = "070210";

        cy.get('input[name="txtOTP"]')
            .should("be.visible")
            .type(otp, { log: false });


        // ==================================================
        // STEP 10: SUBMIT OTP
        // ==================================================

        cy.log("STEP 10: Submitting OTP");

        cy.get('input[name="btnSubmit"]')
            .should("be.visible")
            .click();


        // ==================================================
        // STEP 11: VERIFY TRADE LICENSE DASHBOARD
        // ==================================================

        cy.log("STEP 11: Verifying Trade License Dashboard");

        cy.location("pathname", { timeout: 60000 })
            .should("include", "trade_license_home_ver4");

        cy.url().should("include", "/newv/TradeLicense/trade_license_home_ver4");

        cy.url().then((url) => {

            dashboardUrl = url;

            cy.log("Dashboard URL: " + dashboardUrl);
        });

        cy.get(".sidebar-nav", { timeout: 30000 }).should("be.visible");

        cy.log("Login successful - Dashboard reached");


        // ==================================================
        // STEP 12: COLLECT MAIN MENU INFORMATION
        // ==================================================

        cy.log("STEP 12: Collecting Main Menu Information");

        cy.get(".sidebar-nav > ul > li.nav-item")
            .should("have.length.greaterThan", 0)
            .then(($items) => {

                $items.each((index, element) => {

                    const $item = Cypress.$(element);

                    const $mainLink = $item.children("a").first();

                    const menuName = $mainLink.find(".nav-label").text().trim();

                    const href = $mainLink.attr("href");


                    if (href && href.toLowerCase().includes("logout.aspx")) {

                        logoutUrl = $mainLink.prop("href");

                        return;
                    }

                    if (menuName.toLowerCase() === "dashboard" || !menuName) {
                        return;
                    }

                    if ($mainLink.hasClass("has-submenu-toggle")) {

                        mainMenus.push({
                            index: index,
                            name: menuName
                        });
                    }
                });

                cy.log("Total Main Menus Found: " + mainMenus.length);

                expect(mainMenus.length).to.be.greaterThan(0);

                expect(logoutUrl).to.not.equal("");
            });


        // ==================================================
        // STEP 13: OPEN ALL MAIN MENUS TOGETHER
        // ==================================================

        cy.log("STEP 13: Opening All Main Menus Together");

        expandAllMainMenus();


        // ==================================================
        // COLLECT ALL SUBMENU LINKS
        // EXCLUDED URLS ARE FILTERED BEFORE COUNTING
        // ==================================================

        cy.get(".sidebar-nav > ul > li.nav-item")
            .then(($items) => {

                $items.each((index, element) => {

                    const $item = Cypress.$(element);

                    const parentMenuName = $item
                        .children("a")
                        .first()
                        .find(".nav-label")
                        .text()
                        .trim();

                    const $links = $item.find("ul.nav-submenu a[href]");

                    $links.each((linkIndex, linkElement) => {

                        const $link = Cypress.$(linkElement);

                        const pageName = $link.text().trim();

                        let pageUrl = $link.prop("href");


                        // ------------------------------------------
                        // CORRECT URL FOR THE 2 COLLECTION REPORTS
                        // ------------------------------------------

                        if (
                            pageUrl &&
                            pageUrl.toLowerCase().includes(DUE_PAID_PAGE_KEY)
                        ) {

                            dueStatusLinkCount++;

                            if (pageName.includes("নবায়ন")) {

                                pageUrl = RENEW_REPORT_URL;

                            } else if (pageName.includes("আবেদন")) {

                                pageUrl = APPL_REPORT_URL;

                            } else {

                                pageUrl = dueStatusLinkCount === 1
                                    ? APPL_REPORT_URL
                                    : RENEW_REPORT_URL;
                            }
                        }


                        // ------------------------------------------
                        // SKIP THE 3 EXCLUDED URLS
                        // ------------------------------------------

                        if (pageUrl && isExcludedPageUrl(pageUrl)) {

                            return;
                        }


                        // ------------------------------------------
                        // COLLECT REMAINING SUBMENU LINKS
                        // ------------------------------------------

                        if (
                            pageName &&
                            pageUrl &&
                            !pageUrl.includes("#") &&
                            !pageUrl.toLowerCase().includes("logout")
                        ) {

                            totalLinks++;

                            const alreadyExists = submenuPages.some(
                                (page) => page.url === pageUrl
                            );

                            if (alreadyExists) {

                                duplicateLinks.push({
                                    name: pageName,
                                    url: pageUrl,
                                    parentMenu: parentMenuName
                                });
                            }

                            if (!alreadyExists || VISIT_DUPLICATE_LINKS) {

                                submenuPages.push({
                                    name: pageName,
                                    url: pageUrl,
                                    parentMenu: parentMenuName
                                });
                            }
                        }
                    });
                });
            })
            .then(() => {

                cy.log("--------------------------------");

                cy.log("Total Main Menus: " + mainMenus.length);

                cy.log("Total Submenu Links: " + totalLinks);

                cy.log("Submenu Pages To Visit: " + submenuPages.length);

                cy.log("Duplicate Links: " + duplicateLinks.length);

                cy.log("--------------------------------");


                duplicateLinks.forEach((d) => {

                    cy.log(`DUPLICATE: [${d.parentMenu}] ${d.name} -> ${d.url}`);

                    console.log(`DUPLICATE: [${d.parentMenu}] ${d.name} -> ${d.url}`);
                });


                expect(mainMenus.length, "Main menus")
                    .to.eq(EXPECTED_MAIN_MENUS);

                expect(totalLinks, "Total submenu links")
                    .to.eq(EXPECTED_TOTAL_LINKS);

                expect(submenuPages.length, "Submenu pages to visit")
                    .to.eq(EXPECTED_PAGES_TO_VISIT);
            });


        // ==================================================
        // VERIFY ALL MAIN MENUS ARE OPEN
        // ==================================================

        cy.get(".sidebar-nav ul.nav-submenu")
            .should("have.length", EXPECTED_MAIN_MENUS)
            .each(($submenu) => {

                cy.wrap($submenu).should("be.visible");
            });

        cy.log("SUCCESS: All Main Menus Are Open");


        // ==================================================
        // STEP 14: VISIT ALL SUBMENU PAGES
        // ==================================================

        cy.log("STEP 14: Visiting All Submenu Pages");

        cy.then(() => {

            cy.wrap(submenuPages).each((page, index) => {

                cy.log("--------------------------------");

                cy.log(
                    "Visiting Page " + (index + 1) + "/" + submenuPages.length
                );

                cy.log("Main Menu: " + page.parentMenu);

                cy.log("Submenu: " + page.name);

                cy.log("URL: " + page.url);


                currentPageUrl = page.url;

                cy.visit(page.url, { failOnStatusCode: false });


                cy.get("body", { timeout: 30000 }).should("exist");

                cy.get("body").should(($body) => {

                    expect($body.text().trim().length).to.be.greaterThan(0);
                });


                let pageIsBroken = false;
                let pageHasNoSidebar = false;


                cy.get("body").then(($body) => {

                    const hasSidebar =
                        $body.find(".sidebar-nav").length > 0;

                    const preview = $body
                        .text()
                        .replace(/\s+/g, " ")
                        .trim()
                        .substring(0, 300);


                    cy.log("Sidebar present: " + hasSidebar);

                    cy.log("BODY PREVIEW: " + preview);


                    console.log(
                        "[" + page.name + "] sidebar=" + hasSidebar +
                        " | body: " + preview
                    );


                    const looksLikeErrorPage =
                        !hasSidebar &&
                        ERROR_PAGE_PATTERNS.some((t) => preview.includes(t));


                    if (looksLikeErrorPage) {

                        pageIsBroken = true;

                        const info = {
                            name: page.name,
                            parentMenu: page.parentMenu,
                            url: page.url,
                            error: preview
                        };

                        brokenPages.push(info);

                        cy.log("NEW BROKEN PAGE: " + page.name);

                        cy.screenshot("broken-page-" + (index + 1), {
                            capture: "viewport"
                        });

                    } else if (!hasSidebar) {

                        pageHasNoSidebar = true;

                        noSidebarPages.push({
                            name: page.name,
                            parentMenu: page.parentMenu,
                            url: page.url
                        });

                        cy.log("NO SIDEBAR PAGE (skipping menu check): " + page.name);
                    }
                });


                cy.then(() => {

                    if (pageIsBroken || pageHasNoSidebar) {

                        cy.visit(dashboardUrl);

                        cy.get(".sidebar-nav", { timeout: 30000 })
                            .should("exist");

                        return;
                    }


                    expandAllMainMenus();

                    cy.get(".sidebar-nav ul.nav-submenu")
                        .should("have.length", EXPECTED_MAIN_MENUS)
                        .each(($submenu) => {

                            cy.wrap($submenu).should("be.visible");
                        });
                });


                cy.log("PAGE LOADED: " + page.name);

                cy.log("ALL MAIN MENUS REMAIN OPEN");
            });
        });


        // ==================================================
        // FINAL PAGE ERROR SUMMARY
        // ==================================================

        cy.then(() => {

            cy.log("====================================");

            cy.log("Pages without sidebar: " + noSidebarPages.length);

            noSidebarPages.forEach((n) => {

                cy.log(
                    "NO SIDEBAR: [" + n.parentMenu + "] " +
                    n.name + " -> " + n.url
                );
            });


            cy.log("New broken pages: " + brokenPages.length);

            brokenPages.forEach((b) => {

                cy.log(
                    "NEW BUG: [" + b.parentMenu + "] " +
                    b.name + " -> " + b.url
                );
            });


            cy.log("====================================");


            expect(
                brokenPages.map((b) => b.name + " -> " + b.url),
                "Pages returning a server error"
            ).to.deep.equal([]);
        });


        // ==================================================
        // STEP 15: RETURN TO DASHBOARD
        // ==================================================

        cy.log("STEP 15: Returning to Dashboard");

        cy.then(() => {

            currentPageUrl = "";

            expect(dashboardUrl).to.not.equal("");

            cy.visit(dashboardUrl);
        });

        cy.get(".sidebar-nav", { timeout: 30000 }).should("be.visible");

        cy.log("Dashboard Loaded Successfully");


        // ==================================================
        // STEP 16: LOGOUT
        // ==================================================

        cy.log("STEP 16: Logging Out");

        cy.then(() => {

            if (!logoutUrl) {
                throw new Error("Logout URL was not found");
            }

            cy.log("Logout URL: " + logoutUrl);

            cy.visit(logoutUrl);
        });


        // ==================================================
        // STEP 17: VERIFY LOGIN PAGE
        // ==================================================

        cy.log("STEP 17: Verifying Login Page");

        cy.location("pathname", { timeout: 30000 })
            .should("match", /default/i);

        cy.get("#txtLogin", { timeout: 30000 }).should("be.visible");

        cy.get("#txtPwd").should("be.visible");

        cy.log("SUCCESS: Logout Completed");

        cy.log("SUCCESS: Redirected to Login Page");


        // ==================================================
        // FINAL SUMMARY
        // ==================================================

        cy.then(() => {

            cy.log("====================================");

            cy.log("TRADE LICENSE AUTOMATION COMPLETED");

            cy.log("Main Menus Opened: " + mainMenus.length);

            cy.log("Total Submenu Links: " + totalLinks);

            cy.log("Submenu Pages Visited: " + submenuPages.length);

            cy.log("Login: SUCCESS");

            cy.log("OTP Verification: SUCCESS");

            cy.log("Dashboard: SUCCESS");

            cy.log("Main Menu Navigation: COMPLETED");

            cy.log("Submenu Navigation: COMPLETED");

            cy.log("Logout: SUCCESS");

            cy.log("Login Page Verification: SUCCESS");


            cy.log(
                "Pages with CascadingDropDown bug: " + cascadingBugPages.size
            );

            cascadingBugPages.forEach((url) => {

                cy.log("BUG PAGE: " + url);

                console.log("BUG PAGE: " + url);
            });


            cy.log("====================================");
        });
    });
});
