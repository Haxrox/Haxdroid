/*
 * Test for determining the HTML element to search for Badminton links
 */

const Axios = require('axios');
const Cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');

const ENROLL_BTN_CLASS = "enroll-btn"


/**
 * Check whether enroll button is active
 * @param {string} url url for the badminton registration
 * @return {Promise} which returns boolean whether the enroll button is active
*/
function checkEnrollBtn(url) {
  return new Promise(async (resolve, reject) => {
    const BROWSER = await puppeteer.launch();
    const PAGE = await BROWSER.newPage();

    await PAGE.goto(url, {waitUntil: 'networkidle0'});
    const html = await PAGE.content();
    // fs.writeFileSync("test3.html", html);
    const enroll_btn = await PAGE.$$eval(`.${ENROLL_BTN_CLASS} > *`, (el) =>
      el.map(el => el.outerHTML)
    );

    console.log(enroll_btn);

    BROWSER.close();
    resolve(enroll_btn[0].includes('openings remaining Enroll Now'));
  });
}

// Full
checkEnrollBtn("https://anc.ca.apm.activecommunities.com/burnaby/activity/search/detail/60922?onlineSiteId=0&from_original_cui=true").then(console.log)

// Enroll
checkEnrollBtn("https://anc.ca.apm.activecommunities.com/burnaby/activity/search/detail/51559?onlineSiteId=0&from_original_cui=true").then(console.log)

// Future
checkEnrollBtn("https://anc.ca.apm.activecommunities.com/burnaby/activity/search/detail/58994?onlineSiteId=0&from_original_cui=true").then(console.log)

// Closed
checkEnrollBtn("https://anc.ca.apm.activecommunities.com/burnaby/activity/search/detail/60921?onlineSiteId=0&from_original_cui=true").then(console.log)