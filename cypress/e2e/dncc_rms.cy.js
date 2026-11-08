// ======================================================
// DNCC RMS - COMPLETE LOGIN & DASHBOARD MENU TESTING
// Total Modules: 6
// Total Submenu Pages: 43
// ======================================================


// Ignore known application JavaScript errors
Cypress.on("uncaught:exception", (err) => {

  const ignoredErrors = [
    "jQuery is not defined",
    "$ is not defined",
    "$ is not a function",
    "Cannot read properties of null (reading 'style')",
    "Unexpected token 'this'"
  ];

  if (ignoredErrors.some((message) =>
    err.message.includes(message)
  )) {
    console.error("Application JavaScript Error:", err.message);
    return false;
  }

});


describe("DNCC RMS - Complete Login & Dashboard Menu Testing", () => {

  let credentials;

  before(() => {

    cy.task("getCredentials").then((data) => {

      credentials = data;

      expect(credentials.username).to.be.a("string").and.not.empty;
      expect(credentials.password).to.be.a("string").and.not.empty;

    });

  });


  it("Login, verify OTP and test all dashboard menus and submenus", () => {

    let totalMainMenus = 0;


    // ==================================================
    // STEP 1: UNLOCK USER
    // ==================================================

    cy.request({
      method: "GET",
      url: "/web/userulocknew.aspx",
      qs: {
        cuserid: credentials.username
      }
    }).then((response) => {

      expect(response.status).to.eq(200);

      cy.log("User unlocked successfully");

    });


    // ==================================================
    // STEP 2: OPEN LOGIN PAGE
    // ==================================================

    cy.visit("/newv/Default");


    // ==================================================
    // STEP 3: SELECT WING
    // ==================================================

    cy.get('select[name="ddType"]')
      .should("be.visible")
      .select("b");


    // ==================================================
    // STEP 4: SELECT SECTION
    // ==================================================

    cy.get('select[name="ddlGender"]', {
      timeout: 30000
    }).should("be.visible");

    cy.get('select[name="ddlGender"]')
      .select("1");


    // ==================================================
    // STEP 5: ENTER USERNAME
    // ==================================================

    cy.get('input[name="txtLogin"]')
      .should("be.visible")
      .clear()
      .type(credentials.username);


    // ==================================================
    // STEP 6: ENTER PASSWORD
    // ==================================================

    cy.get('input[name="txtPwd"]')
      .should("be.visible")
      .clear()
      .type(credentials.password, {
        log: false
      });


    // ==================================================
    // STEP 7: LOGIN
    // ==================================================

    cy.get('input[name="btnSubmit"]')
      .should("be.visible")
      .click();


    // ==================================================
    // STEP 8: VERIFY OTP PAGE
    // ==================================================

    cy.location("pathname", {
      timeout: 60000
    }).should("include", "otpverification");

    cy.log("OTP page reached");


    // ==================================================
    // STEP 9: ENTER OTP MANUALLY
    // ==================================================

    cy.window().then((win) => {

      const otp = win.prompt("Enter your 6-digit OTP:");

      if (!otp || !/^\d{6}$/.test(otp.trim())) {

        throw new Error("Invalid OTP");

      }

      return otp.trim();

    }).then((otp) => {

      cy.get('input[name="txtOTP"]')
        .should("be.visible")
        .type(otp, {
          log: false
        });


      // ================================================
      // STEP 10: SUBMIT OTP
      // ================================================

      cy.get('input[name="btnSubmit"]')
        .should("be.visible")
        .click();

    });


    // ==================================================
    // STEP 11: VERIFY DASHBOARD
    // ==================================================

    cy.location("pathname", {
      timeout: 60000
    }).should("include", "homenew_ver2");

    cy.url().should(
      "include",
      "/newv/web/homenew_ver2"
    );

    cy.log("Login successful - Dashboard reached");


    // ==================================================
    // STEP 12: VERIFY DASHBOARD MENU CONTAINER
    // ==================================================

    cy.get("ul.list-unstyled", {
      timeout: 30000
    }).should("be.visible");


    // ==================================================
    // STEP 13: VERIFY DASHBOARD MENU
    // ==================================================

    cy.get("a#lnkDashboard")
      .should("be.visible")
      .and("contain", "Dashboard");

    cy.log("Dashboard menu verified");


    // ==================================================
    // STEP 14: FIND ALL MAIN MENUS
    // ==================================================

    cy.get("ul.list-unstyled > li.nav-item")
      .then(($items) => {

        const menus = [];

        $items.each((index, element) => {

          const menu = Cypress.$(element)
            .find("a.has-submenu-toggle");

          if (menu.length > 0) {

            menus.push({
              name: menu.find(".nav-label").text().trim(),
              element: element
            });

          }

        });

        expect(menus.length).to.be.greaterThan(0);

        totalMainMenus = menus.length;

        cy.log(`Total Main Menus: ${totalMainMenus}`);


        // ==============================================
        // STEP 15: VERIFY ALL MAIN MENUS AND SUBMENUS
        // ==============================================

        cy.wrap(menus).each((menuData) => {

          const menuName = menuData.name;

          cy.log(`Checking Main Menu: ${menuName}`);

          cy.wrap(menuData.element)
            .find("a.has-submenu-toggle")
            .click();

          cy.wrap(menuData.element)
            .find("ul.nav-submenu")
            .should("be.visible")
            .within(() => {

              cy.get("a").each(($link) => {

                const submenuName = $link.text().trim();

                const submenuURL = $link.attr("href");

                expect(submenuName).not.to.be.empty;

                expect(submenuURL).not.to.be.empty;

                cy.log(
                  `Submenu: ${submenuName} | URL: ${submenuURL}`
                );

              });

            });

        });

      });


    // ==================================================
    // STEP 16: MASTER MENU
    // ==================================================

    const masterPages = [

      {
        name: "নতুন অঞ্চল",
        url: "/newv/web/zone_master.aspx?id=-1"
      },

      {
        name: "নতুন ওয়ার্ড",
        url: "/newv/web/ward_master.aspx?pk=-1"
      },

      {
        name: "নতুন সেক্টর",
        url: "/newv/web/sector_master.aspx?pk=-1"
      },

      {
        name: "নতুন এরিয়া",
        url: "/newv/web/area_master.aspx?pk=-1"
      },

      {
        name: "নতুন রোড",
        url: "/newv/web/road_master.aspx?pk=-1"
      }

    ];


    cy.log("===== MASTER MENU TESTING STARTED =====");


    cy.contains("a.has-submenu-toggle", "মাস্টার")
      .should("be.visible")
      .click();


    cy.contains("a.has-submenu-toggle", "মাস্টার")
      .closest("li.nav-item")
      .find("ul.nav-submenu")
      .should("be.visible");


    cy.wrap(masterPages).each((page) => {

      cy.log(`Visiting: ${page.name}`);


      cy.contains("ul.nav-submenu a", page.name)
        .should("be.visible")
        .click();


      const expectedPath = page.url
        .split("?")[0]
        .replace(".aspx", "");


      cy.location("pathname", {
        timeout: 30000
      }).should("include", expectedPath);


      const expectedQuery = page.url.split("?")[1];

      if (expectedQuery) {

        cy.location("search")
          .should("eq", "?" + expectedQuery);

      }


      cy.document()
        .its("readyState")
        .should("eq", "complete");


      cy.log(`SUCCESS: ${page.name}`);


      // Return to Dashboard
      cy.visit("/newv/web/homenew_ver2.aspx");


      cy.location("pathname", {
        timeout: 30000
      }).should("include", "homenew_ver2");


      // Reopen Master Menu
      cy.contains("a.has-submenu-toggle", "মাস্টার")
        .should("be.visible")
        .click();


      cy.contains("a.has-submenu-toggle", "মাস্টার")
        .closest("li.nav-item")
        .find("ul.nav-submenu")
        .should("be.visible");

    });


    cy.log("===== ALL MASTER PAGES TESTED =====");



    // ==================================================
    // STEP 17: APPLICATION MENU
    // ==================================================

    const applicationPages = [

      {
        name: "নতুন ই-হোল্ডিং নাম্বারের আবেদন",
        url: "/newv/web/NewApplicationPTax_Ver2.aspx"
      },

      {
        name: "নতুন আবেদন অনুসন্ধান",
        url: "/newv/web/searchHoldingTaxRQ_ver2.aspx"
      },

      {
        name: "নতুন আবেদন স্থিতি অনুসন্ধান (Online)",
        url: "/newv/web/searchHoldingTaxRQstatus.aspx"
      }

    ];


    cy.log("===== APPLICATION MENU TESTING STARTED =====");


    cy.contains("a.has-submenu-toggle", "আবেদন বিষয়ক")
      .should("be.visible")
      .click();


    cy.contains("a.has-submenu-toggle", "আবেদন বিষয়ক")
      .closest("li.nav-item")
      .find("ul.nav-submenu")
      .should("be.visible");


    cy.wrap(applicationPages).each((page) => {

      cy.log(`Visiting: ${page.name}`);


      cy.contains("ul.nav-submenu a", page.name)
        .should("be.visible")
        .click();


      const expectedPath = page.url
        .split("?")[0]
        .replace(".aspx", "");


      cy.location("pathname", {
        timeout: 30000
      }).should("include", expectedPath);


      cy.document()
        .its("readyState")
        .should("eq", "complete");


      cy.log(`SUCCESS: ${page.name}`);


      cy.visit("/newv/web/homenew_ver2.aspx");


      cy.location("pathname", {
        timeout: 30000
      }).should("include", "homenew_ver2");


      cy.contains("a.has-submenu-toggle", "আবেদন বিষয়ক")
        .should("be.visible")
        .click();


      cy.contains("a.has-submenu-toggle", "আবেদন বিষয়ক")
        .closest("li.nav-item")
        .find("ul.nav-submenu")
        .should("be.visible");

    });


    cy.log("===== ALL APPLICATION PAGES TESTED =====");



    // ==================================================
    // STEP 18: E-HOLDING MENU
    // ==================================================

    const eHoldingPages = [

      {
        name: "নতুন ই-হোল্ডিং জেনারেশন",
        url: "/newv/web/inserteholding.aspx"
      },

      {
        name: "এসেসমেন্ট ইতিহাস",
        url: "/newv/web/assesment_history.aspx"
      },

      {
        name: "ই-হোল্ডিং নাম্বার অনুসন্ধান",
        url: "/newv/web/searchholdingtaxver2.aspx"
      },

      {
        name: "ই-হোল্ডিং এসেসমেন্ট",
        url: "/newv/web/taxassesment_ver3_auto.aspx"
      },

      {
        name: "ই-হোল্ডিং নিষ্ক্রিয়করণ",
        url: "/newv/web/search_holding_tax_deact.aspx"
      },

      {
        name: "নিষ্ক্রিয়করণ ই-হোল্ডিং অনুসন্ধান",
        url: "/newv/web/search_deactivate_tax.aspx"
      },

      {
        name: "ই-হোল্ডিং বাতিল",
        url: "/newv/web/search_remove_holding.aspx"
      },

      {
        name: "মুক্তিযোদ্ধা সুবিধা অনুসন্ধান (অনলাইন)",
        url: "/newv/web/AbandonFormApproval/muktijoddhasubidhasearch.aspx"
      },

      {
        name: "নামজারি অনুসন্ধান (অনলাইন)",
        url: "/newv/web/AbandonFormApproval/namjariapplicationsearch.aspx"
      },

      {
        name: "নয়াবাদি অনুসন্ধান",
        url: "/newv/web/AbandonFormApproval/nayabadiapplicationsearch.aspx"
      },

      {
        name: "নয়াবাদি আবেদন",
        url: "/newv/web/AbandonFormApproval/nayabadi-application.aspx"
      }

    ];


    cy.log("===== E-HOLDING MENU TESTING STARTED =====");


    cy.contains("a.has-submenu-toggle", "ই-হোল্ডিং বিষয়ক")
      .should("be.visible")
      .click();


    cy.contains("a.has-submenu-toggle", "ই-হোল্ডিং বিষয়ক")
      .closest("li.nav-item")
      .find("ul.nav-submenu")
      .should("be.visible");


    cy.wrap(eHoldingPages).each((page) => {

      cy.log(`Visiting: ${page.name}`);


      // API Intercepts for E-Holding Generation
      if (page.name === "নতুন ই-হোল্ডিং জেনারেশন") {

        cy.intercept(
          "POST",
          "**/ServiceVB.asmx/GetZone"
        ).as("getZone");


        cy.intercept(
          "POST",
          "**/ServiceVB.asmx/GetWard"
        ).as("getWard");

      }


      cy.contains("ul.nav-submenu a", page.name)
        .should("be.visible")
        .click();


      const expectedPath = page.url
        .split("?")[0]
        .replace(".aspx", "");


      cy.location("pathname", {
        timeout: 30000
      }).should("include", expectedPath);


      cy.document()
        .its("readyState")
        .should("eq", "complete");


      // Verify API responses
      if (page.name === "নতুন ই-হোল্ডিং জেনারেশন") {

        cy.wait("@getZone", {
          timeout: 30000
        }).then((interception) => {

          expect(interception.response).to.exist;

          expect(interception.response.statusCode).to.eq(200);

          cy.log("GetZone API: HTTP 200 SUCCESS");

        });


        cy.wait("@getWard", {
          timeout: 30000
        }).then((interception) => {

          expect(interception.response).to.exist;

          expect(interception.response.statusCode).to.eq(200);

          cy.log("GetWard API: HTTP 200 SUCCESS");

        });

      }


      cy.log(`SUCCESS: ${page.name}`);


      cy.visit("/newv/web/homenew_ver2.aspx");


      cy.location("pathname", {
        timeout: 30000
      }).should("include", "homenew_ver2");


      cy.contains("a.has-submenu-toggle", "ই-হোল্ডিং বিষয়ক")
        .should("be.visible")
        .click();


      cy.contains("a.has-submenu-toggle", "ই-হোল্ডিং বিষয়ক")
        .closest("li.nav-item")
        .find("ul.nav-submenu")
        .should("be.visible");

    });


    cy.log("===== ALL E-HOLDING PAGES TESTED =====");



    // ==================================================
    // STEP 19: ADAY SANGRAHA MENU
    // ==================================================

    const collectionPages = [

      {
        name: "সারচার্জ মওকুফ",
        url: "/newv/web/SurchargeWaiver.aspx"
      },

      {
        name: "লেনদেনের বিবরণ",
        url: "/newv/web/online_payment.aspx"
      },

      {
        name: "ব্যাংক কনফার্মেশন",
        url: "/newv/web/bankchallan.aspx"
      },

      {
        name: "বকেয়া সেটেলমেন্ট",
        url: "/newv/web/dueSettlement.aspx"
      },

      {
        name: "আংশিক আদায়",
        url: "/newv/web/taxPayment.aspx"
      },

      {
        name: "৭৫% প্রদান",
        url: "/newv/web/holding_tax_manip_ver2.aspx"
      },

      {
        name: "অন্যান্য আদায়",
        url: "/newv/web/paymentother.aspx"
      },

      {
        name: "এসেসমেন্ট পেমেন্ট এফেক্ট",
        url: "/newv/web/jobinsertHoldingTaxAssesment.aspx"
      },

      {
        name: "আদায় সংগ্রহ",
        url: "/newv/web/DNCCPoratlPDPaymentAction.aspx"
      },

      {
        name: "অন্যান্য লেনদেনের বিবরণ",
        url: "/newv/web/online_payment_others.aspx"
      },

      {
        name: "৭৫% প্রদান অনুসন্ধান",
        url: "/newv/web/holding_tax_modi_search.aspx"
      }

    ];


    cy.log("===== ADAY SANGRAHA MENU TESTING STARTED =====");


    cy.contains("a.has-submenu-toggle", "আদায় সংগ্রহ")
      .should("be.visible")
      .click();


    cy.contains("a.has-submenu-toggle", "আদায় সংগ্রহ")
      .closest("li.nav-item")
      .find("ul.nav-submenu")
      .should("be.visible");


    cy.wrap(collectionPages).each((page) => {

      cy.log(`Visiting: ${page.name}`);


      cy.contains("ul.nav-submenu a", page.name)
        .should("be.visible")
        .click();


      const expectedPath = page.url
        .split("?")[0]
        .replace(".aspx", "");


      cy.location("pathname", {
        timeout: 30000
      }).should("include", expectedPath);


      cy.document()
        .its("readyState")
        .should("eq", "complete");


      cy.log(`SUCCESS: ${page.name}`);


      cy.visit("/newv/web/homenew_ver2.aspx");


      cy.location("pathname", {
        timeout: 30000
      }).should("include", "homenew_ver2");


      cy.contains("a.has-submenu-toggle", "আদায় সংগ্রহ")
        .should("be.visible")
        .click();


      cy.contains("a.has-submenu-toggle", "আদায় সংগ্রহ")
        .closest("li.nav-item")
        .find("ul.nav-submenu")
        .should("be.visible");

    });


    cy.log("===== ALL ADAY SANGRAHA PAGES TESTED =====");



    // ==================================================
    // STEP 20: NOTICE MENU
    // ==================================================

    const noticePages = [

      {
        name: "বিল প্রিন্ট সেটিং",
        url: "/newv/web/BillPrintSetting.aspx"
      },

      {
        name: "নোটিশ সমূহ",
        url: "/newv/web/rpt_taxCompletionNotice.aspx"
      },

      {
        name: "বকেয়া বিল প্রিন্ট নোটিশ",
        url: "/newv/web/rpt_taxCompletionNotice_noofdues.aspx"
      }

    ];


    cy.log("===== NOTICE MENU TESTING STARTED =====");


    // Open Notice Menu
    cy.contains("a.has-submenu-toggle", "নোটিশ")
      .should("be.visible")
      .click();


    // Verify Notice Submenu
    cy.contains("a.has-submenu-toggle", "নোটিশ")
      .closest("li.nav-item")
      .find("ul.nav-submenu")
      .should("be.visible");


    // Visit each Notice page
    cy.wrap(noticePages).each((page) => {

      cy.log(`Visiting Notice: ${page.name}`);


      // Exact text matching
      cy.get("ul.nav-submenu a")
        .filter((index, element) => {

          return element.innerText.trim() === page.name;

        })
        .should("have.length", 1)
        .and("be.visible")
        .click();


      // Verify URL
      const expectedPath = page.url
        .split("?")[0]
        .replace(".aspx", "");


      cy.location("pathname", {
        timeout: 30000
      }).should("include", expectedPath);


      // Verify page loading
      cy.document()
        .its("readyState")
        .should("eq", "complete");


      cy.log(`SUCCESS: ${page.name}`);


      // Return to Dashboard
      cy.visit("/newv/web/homenew_ver2.aspx");


      cy.location("pathname", {
        timeout: 30000
      }).should("include", "homenew_ver2");


      // Open Notice Menu again
      cy.contains("a.has-submenu-toggle", "নোটিশ")
        .should("be.visible")
        .click();


      cy.contains("a.has-submenu-toggle", "নোটিশ")
        .closest("li.nav-item")
        .find("ul.nav-submenu")
        .should("be.visible");

    });


    cy.log("===== ALL NOTICE PAGES TESTED =====");



    // ==================================================
    // STEP 21: REPORT MENU
    // ==================================================

    const reportPages = [

      {
        name: "মোট আদায় বিবরণী",
        url: "/newv/web/TaxDetailsByHoldingTax.aspx"
      },

      {
        name: "ই-হোল্ডিং নাম্বারের বিবরণ",
        url: "/newv/web/printHoldingTax.aspx"
      },

      {
        name: "আদায়ের লক্ষ্যমাত্রা",
        url: "/newv/web/targetcollection.aspx"
      },

      {
        name: "আদায় বিবরণী",
        url: "/newv/web/rptDueCollection.aspx?status=C"
      },

      {
        name: "বকেয়া কাস্টোমাইজ রিপোর্ট",
        url: "/newv/web/rptCollectionByAmt.aspx?status=P"
      },

      {
        name: "বার্ষিক কর পরিসংখ্যানের বিবরণ",
        url: "/newv/web/rpt_revenue_holding_tax.aspx?reportid=H00003"
      },

      {
        name: "ত্রৈমাসিক ভিত্তিতে বকেয়া পাওনার পরিমান",
        url: "/newv/web/rpt_due_no_of_installments.aspx?status=P"
      },

      {
        name: "বকেয়া পাওনার পরিমান",
        url: "/newv/web/rptDueCollection.aspx?status=P"
      },

      {
        name: "অনলাইন হোল্ডিং রিপোর্ট",
        url: "/newv/web/rpt_onlineholding.aspx"
      },

      {
        name: "সকল হোল্ডিং ডাউনলোড",
        url: "/newv/web/rpt_template.aspx"
      }

    ];


    cy.log("===== REPORT MENU TESTING STARTED =====");


    // Open Report Menu
    cy.contains("a.has-submenu-toggle", "রিপোর্ট")
      .should("be.visible")
      .click();


    cy.contains("a.has-submenu-toggle", "রিপোর্ট")
      .closest("li.nav-item")
      .find("ul.nav-submenu")
      .should("be.visible");


    // Visit each Report page
    cy.wrap(reportPages).each((page) => {

      cy.log(`Visiting Report: ${page.name}`);


      // Exact text matching to prevent partial match errors
      cy.get("ul.nav-submenu a")
        .filter((index, element) => {

          return element.innerText.trim() === page.name;

        })
        .should("have.length", 1)
        .and("be.visible")
        .click();


      // Verify URL
      const expectedPath = page.url
        .split("?")[0]
        .replace(".aspx", "");


      cy.location("pathname", {
        timeout: 30000
      }).should("include", expectedPath);


      // Verify query parameter
      const queryString = page.url.split("?")[1];

      if (queryString) {

        cy.location("search")
          .should("eq", "?" + queryString);

      }


      // Verify page loading
      cy.document()
        .its("readyState")
        .should("eq", "complete");


      cy.log(`SUCCESS: ${page.name}`);


      // Return to Dashboard
      cy.visit("/newv/web/homenew_ver2.aspx");


      cy.location("pathname", {
        timeout: 30000
      }).should("include", "homenew_ver2");


      // Open Report Menu again
      cy.contains("a.has-submenu-toggle", "রিপোর্ট")
        .should("be.visible")
        .click();


      cy.contains("a.has-submenu-toggle", "রিপোর্ট")
        .closest("li.nav-item")
        .find("ul.nav-submenu")
        .should("be.visible");

    });


    cy.log("===== ALL REPORT PAGES TESTED =====");



    // ==================================================
    // STEP 22: FINAL TEST SUMMARY
    // ==================================================

    cy.log("========== FINAL TEST SUMMARY ==========");


    cy.log(`Total Main Menus: ${totalMainMenus}`);


    cy.log(`Total Master Pages Visited: ${masterPages.length}`);


    cy.log(`Total Application Pages Visited: ${applicationPages.length}`);


    cy.log(`Total E-Holding Pages Visited: ${eHoldingPages.length}`);


    cy.log(`Total Adai Sangraha Pages Visited: ${collectionPages.length}`);


    cy.log(`Total Notice Pages Visited: ${noticePages.length}`);


    cy.log(`Total Report Pages Visited: ${reportPages.length}`);


    cy.log("Login: SUCCESS");

    cy.log("OTP Verification: SUCCESS");

    cy.log("Dashboard: SUCCESS");

    cy.log("Main Menu Verification: SUCCESS");

    cy.log("Master Submenu Navigation: SUCCESS");

    cy.log("Application Submenu Navigation: SUCCESS");

    cy.log("E-Holding Submenu Navigation: SUCCESS");

    cy.log("Adai Sangraha Submenu Navigation: SUCCESS");

    cy.log("Notice Submenu Navigation: SUCCESS");

    cy.log("Report Submenu Navigation: SUCCESS");


    cy.log("Total Module Pages: 43");


    cy.log("========== TEST COMPLETED ==========");


  });

});