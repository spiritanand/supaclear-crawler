import puppeteer from "puppeteer-extra";
import fs from "fs";

import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  await page.goto(
    "https://www.g2.com/categories/data-science-and-machine-learning-platforms?order=popular#product-list",
    {
      waitUntil: "networkidle0",
    }
  );

  const body = await page.evaluate(() => {
    const products = Array.from(document.querySelectorAll(".product-card")).map((el) => {
      // Product name
      const name = el.querySelector(".product-card__product-name")?.textContent;

      // Product description
      const descriptionElement = el.querySelector(".product-listing__paragraph");
      const innerDesc = descriptionElement?.textContent;
      const hiddenDesc =
        descriptionElement?.getAttribute("data-truncate-revealer-overflow-text") ?? "";
      const description = innerDesc + hiddenDesc;

      return { name, description };
    });

    return products;
  });

  await browser.close();

  // save html to file
  fs.writeFileSync("index.json", JSON.stringify(body));
}

main().catch((error) => {
  console.error("An error occurred:", error);
});
