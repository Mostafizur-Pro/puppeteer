const puppeteer = require("puppeteer");
const XLSX = require("xlsx");

const scrapeWebsite = async () => {
  // Launch a browser
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to the target website
  await page.goto(
    "https://shopping.indiamart.com/search.php?ss=Ladies%20Wear",
    {
      waitUntil: "networkidle2",
    }
  );

  // Selectors for product elements
  const selectors = {
    productName: ".prd_nam",
    address: ".addrs svg",
    price: ".prc",
    companyName: ".companyname a",
    legalStatus: ".legal-status-selector",
    annualTurnover: ".annual-turnover-selector",
    mobileForm: ".mobile-form-selector",
    packagingSize: ".clr1",
    packagingType: ".packaging-type-selector",
    brand: ".brand-selector",
    plantPart: ".plant-part-selector",
    usage: ".usage-selector",
    moisture: ".moisture-selector",
    botanicalName: ".botanical-name-selector",
    color: ".prd_isq .clr1 b",
    shelfLife: ".shelf-life-selector",
    feature: ".feature-selector",
    minimumOrder: ".minimum-order-selector",
    quantity: ".quantity-selector",
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
        legalStatus:
          document
            .querySelectorAll(selectors.legalStatus)
            [index]?.innerText.trim() || "N/A",
        annualTurnover:
          document
            .querySelectorAll(selectors.annualTurnover)
            [index]?.innerText.trim() || "N/A",
        mobileForm:
          document
            .querySelectorAll(selectors.mobileForm)
            [index]?.innerText.trim() || "N/A",
        packagingSize:
          document
            .querySelectorAll(selectors.packagingSize)
            [index]?.innerText.trim() || "N/A",
        packagingType:
          document
            .querySelectorAll(selectors.packagingType)
            [index]?.innerText.trim() || "N/A",
        brand:
          document.querySelectorAll(selectors.brand)[index]?.innerText.trim() ||
          "N/A",
        plantPart:
          document
            .querySelectorAll(selectors.plantPart)
            [index]?.innerText.trim() || "N/A",
        usage:
          document.querySelectorAll(selectors.usage)[index]?.innerText.trim() ||
          "N/A",
        moisture:
          document
            .querySelectorAll(selectors.moisture)
            [index]?.innerText.trim() || "N/A",
        botanicalName:
          document
            .querySelectorAll(selectors.botanicalName)
            [index]?.innerText.trim() || "N/A",
        color:
          document.querySelectorAll(selectors.color)[index]?.innerText.trim() ||
          "N/A",
        shelfLife:
          document
            .querySelectorAll(selectors.shelfLife)
            [index]?.innerText.trim() || "N/A",
        feature:
          document
            .querySelectorAll(selectors.feature)
            [index]?.innerText.trim() || "N/A",
        minimumOrder:
          document
            .querySelectorAll(selectors.minimumOrder)
            [index]?.innerText.trim() || "N/A",
        quantity:
          document
            .querySelectorAll(selectors.quantity)
            [index]?.innerText.trim() || "N/A",
      };
    });
  }, selectors);

  //   console.log("Scraped Products:", products);

  // Save data to Excel
  const worksheet = XLSX.utils.json_to_sheet(products);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

  // Write the file
  XLSX.writeFile(workbook, "products1.xlsx");

  //   console.log("Data saved to products.xlsx");

  // Close the browser
  await browser.close();
};

scrapeWebsite();
