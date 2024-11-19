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

/*

  const categoryList = [
    "Cumin Seed Oil",
    "Essential Oils",
    "Refresher Oils",
    "Synthetic Essential Oils",
    "Anti Cellulite Essential Oil",
    "Anti Stress Essential Oils",
    "Aromatherapy Essential Oils",
    "Hair Care Essential Oils",
    "Skin Care Essential Oils",
    "Medicinal Essential Oils",
    "Mustard Essential Oil",
    "Davana Oil",
    "Kewra Oil",
    "Tea Tree Oil",
    "Antibacterial Essential Oils",
    "Nutmeg Oil",
    "Cassia Oil",
    "Emu Oil",
    "Poppy Seed Oil",
  ];


https://www.indiamart.com/proddetail/ipm-cumin-seed-2855103226173.html?pos=1&kwd=cumin%20seed%20processor&tags=A||||8228.275|Price|product|||IVEG|rsf:gd-|-qr_nm:gd|res:RC5|com-cf:nl|ptrs:na|ktp:N0|mc:11270|stype:attr=1|cat:15|mtp:S|qry_typ:P|lang:en|wc:3|cs:8061|v=4|r=4

https://www.indiamart.com/proddetail/brown-cumin-seed-26981104473.html?pos=2&DualProdscaps
https://www.indiamart.com/proddetail/brown-cumin-seeds-2057507033.html?pos=1&nh=Y&DualProdscaps
https://www.indiamart.com/proddetail/brown-jeera-seed-2855126785855.html?pos=1&nh=Y&DualProdscaps


*/
