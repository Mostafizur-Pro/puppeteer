const puppeteer = require("puppeteer-core"); // Use puppeteer-core for custom browser paths
const XLSX = require("xlsx");
const path = require("path");

// Path to the Edge executable
const EDGE_PATH =
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

// Utility function to add a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to block unnecessary resources for faster page loads
const blockUnnecessaryResources = async (page) => {
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const resourceType = req.resourceType();
    if (
      resourceType === "image" ||
      resourceType === "stylesheet" ||
      resourceType === "font"
    ) {
      req.abort();
    } else {
      req.continue();
    }
  });
};

const scrapeWebsite = async () => {
  const browser = await puppeteer.launch({
    headless: false, // Set to false for debugging
    executablePath: EDGE_PATH, // Specify the path to Edge
    defaultViewport: null, // Use full screen
  });

  const page = await browser.newPage();

  await blockUnnecessaryResources(page);

  const categoryList = ["Cumin Seed Oil"]; // Add more categories as needed

  const products = [];
  const scrapedIds = new Set(); // To track unique product IDs
  const PRODUCT_LIMIT = 100; // Limit the number of products per category

  for (const category of categoryList) {
    console.log(`Scraping category: ${category}`);
    const url = `https://dir.indiamart.com/search.mp?ss=${encodeURIComponent(
      category
    )}&v=4&mcatid=36284&catid=411&prdsrc=1`;

    try {
      // Set timeout to 0 (indefinite waiting)
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 0 });
    } catch (err) {
      console.error(`Failed to load category: ${category}`);
      continue;
    }

    // Wait for the products to load
    try {
      await page.waitForSelector(".card", { timeout: 30000 });
    } catch (err) {
      console.error(`No products found for category: ${category}`);
      continue;
    }

    let hasMoreResults = true;

    while (hasMoreResults && products.length < PRODUCT_LIMIT) {
      const initialProductCount = products.length; // Record the count before adding new data

      const productElements = await page.evaluate(() => {
        const products = [];
        document.querySelectorAll(".card").forEach((card) => {
          const id = card.getAttribute("id") || "N/A";
          const productName =
            card.querySelector(".producttitle a")?.textContent.trim() || "N/A";
          const packagingType =
            card
              .querySelector("[data-isq]")
              ?.textContent.match(/Packagi ng Type%3A([^%]*)%23/)?.[1] || "N/A";
          const packagingSize =
            card
              .querySelector("[data-isq]")
              ?.textContent.match(/Packaging Size%3A([^%]*)%23/)?.[1] || "N/A";
          const price =
            card.querySelector(".price")?.textContent.trim() || "N/A";
          const companyName =
            card.querySelector(".companyname a")?.textContent.trim() || "N/A";
          const mobile =
            card.querySelector(".contactnumber .pns_h")?.textContent.trim() ||
            "N/A";

          products.push({
            id,
            productName,
            packagingType,
            packagingSize,
            price,
            companyName,
            mobile,
          });
        });
        return products;
      });

      // Filter out duplicate products
      productElements.forEach((product) => {
        if (!scrapedIds.has(product.id)) {
          scrapedIds.add(product.id); // Mark this ID as scraped
          products.push(product);
        }
      });

      console.log(`Scraped ${products.length} unique products so far.`);

      if (products.length >= PRODUCT_LIMIT) {
        console.log(`Reached product limit of ${PRODUCT_LIMIT}`);
        break;
      }

      // Stop scraping if no new data is added
      if (products.length === initialProductCount) {
        console.log("No new data found. Stopping scrape...");
        break;
      }

      // Check for the "Show More" button and click if available
      const showMoreButton = await page.$(".showmoreresultsdiv button");
      if (showMoreButton) {
        await showMoreButton.click();
        console.log("Clicked 'Show More' button...");
        await delay(2000); // Wait for more products to load
      } else {
        hasMoreResults = false;
      }
    }
  }

  // Save scraped data to Excel
  const worksheet = XLSX.utils.json_to_sheet(products);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
  XLSX.writeFile(workbook, "products.xlsx");

  console.log(
    `Scraping complete. Data saved to "products.xlsx". Total unique products scraped: ${products.length}`
  );

  await browser.close();
};

scrapeWebsite().catch((err) => {
  console.error("Error occurred during scraping:", err);
});
