const puppeteer = require("puppeteer");
const fs = require("fs");

const scrapeWebsite = async () => {
  // Launch a browser
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to the target website
  await page.goto(
    "https://dir.indiamart.com/search.mp?ss=cumin+seed+processor&v=4&mcatid=&catid=&tags=res:RC5|ktp:N0|stype:attr=1|mtp:S|wc:3|qr_nm:gd|cs:8061|com-cf:nl|ptrs:na|mc:11270|cat:15|qry_typ:P|lang:en",
    {
      waitUntil: "networkidle2", // Wait until all network requests are finished.
    }
  );

  // Selectors for product elements
  const productSelector = ".cardlinks"; // Adjust based on the website's structure.

  // Extract data
  const productNames = await page.evaluate((productSelector) => {
    return Array.from(document.querySelectorAll(productSelector)).map((link) =>
      link.innerText.trim()
    );
  }, productSelector);

  // Write product names to CSV file
  fs.writeFileSync("productnames.csv", productNames.join("\n"));

  // Close the browser
  await browser.close();
};

scrapeWebsite();
