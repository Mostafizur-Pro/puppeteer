const puppeteer = require("puppeteer");
const XLSX = require("xlsx");

const scrapeWebsite = async () => {
  // Launch a browser
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to the target website
  await page.goto(
    "https://dir.indiamart.com/search.mp?ss=cumin+seed+processor&v=4&mcatid=&catid=&tags=res:RC5|ktp:N0|stype:attr=1|mtp:S|wc:3|qr_nm:gd|cs:8061|com-cf:nl|ptrs:na|mc:11270|cat:15|qry_typ:P|lang:en",
    {
      waitUntil: "networkidle2",
    }
  );

  // Selectors for product elements
  const selectors = {
    productName: ".cardlinks",
    address: ".addrs svg",
    price: ".price",
    companyName: ".companyname a",
  };

  // Extract data
  const products = await page.evaluate((selectors) => {
    const productElements = Array.from(
      document.querySelectorAll(selectors.productName)
    );
    return productElements.map((element, index) => {
      return {
        productName: element.innerText.trim(),
        address:
          document
            .querySelectorAll(selectors.address)
            [index]?.innerText.trim() || "N/A",
        price:
          document.querySelectorAll(selectors.price)[index]?.innerText.trim() ||
          "N/A",
        companyName:
          document
            .querySelectorAll(selectors.companyName)
            [index]?.innerText.trim() || "N/A",
      };
    });
  }, selectors);

  console.log("Scraped Products:", products);

  // Save data to Excel
  const worksheet = XLSX.utils.json_to_sheet(products);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

  // Write the file
  XLSX.writeFile(workbook, "products.xlsx");

  console.log("Data saved to products.xlsx");

  // Close the browser
  await browser.close();
};

scrapeWebsite();
