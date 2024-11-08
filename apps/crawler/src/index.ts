import puppeteer from "puppeteer-extra";
// import fs from "fs";
import dotenv from "dotenv";
import {
  db,
  products,
  Details,
  UserSatisfaction,
  ScrapedData,
  parsedProducts,
} from "@repo/database";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

dotenv.config();

import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const MAX_PAGES = 1; // to restrict the number of pages to crawl
const ORDER = "popular"; // can be "g2_score", "popular" and "top_shelf"
const CATEGORY = "data-science-and-machine-learning-platforms";
// const CATEGORY = "relational-databases"; // works on every G2 category

async function scrapeProducts() {
  const browser = await puppeteer.launch({ headless: true });

  const allProducts = [];
  for (let currentPage = 1; currentPage <= MAX_PAGES; currentPage++) {
    const URL =
      currentPage === 1
        ? `https://www.g2.com/categories/${CATEGORY}?order=${ORDER}#product-list`
        : `https://www.g2.com/categories/${CATEGORY}?order=${ORDER}&page=${currentPage}#product-list`;

    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    // await page.setViewport({ width: 1920, height: 1080 });

    await page.goto(URL, {
      waitUntil: "networkidle0",
    });

    const productsOnPage = await page.evaluate(() => {
      const products = Array.from(document.querySelectorAll(".product-card")).map((el) => {
        // Product name
        const name = el.querySelector(".product-card__product-name")?.textContent ?? "";
        const srcImage =
          el.querySelector(".product-card__img")?.querySelector("img")?.getAttribute("src") ?? "";
        const image = srcImage.includes("data")
          ? (el
              .querySelector(".product-card__img")
              ?.querySelector("img")
              ?.getAttribute("data-deferred-image-src") ?? "")
          : srcImage;

        // Product description
        const descriptionElement = el.querySelector(".product-listing__paragraph");
        const innerDesc = descriptionElement?.textContent ?? "";
        const hiddenDesc =
          descriptionElement?.getAttribute("data-truncate-revealer-overflow-text") ?? "";
        const description = innerDesc + hiddenDesc;

        // Users, Industries, Market Segment
        const sectionTitles: (keyof Details)[] = ["users", "industries", "marketSegment"];
        const details: Details = {};

        for (let i = 0; i < sectionTitles.length; i++) {
          const title = sectionTitles[i];
          const section = el
            .querySelector("div.grid-x.grid-margin-x.grid-margin-y.pt-half.pb-half-small-only")
            ?.querySelector(`.cell.medium-4:nth-child(${i + 1})`);

          if (section && title) {
            const items = section.querySelectorAll("li");
            details[title] = Array.from(items).map((item) => item?.textContent?.trim());
          }
        }

        // Pricing (Entry Level)
        const pricingElement = el.querySelector(".product-card__price-pill");
        const priceLink = pricingElement?.querySelector("a")?.getAttribute("href");
        const price = pricingElement?.querySelector("a")?.textContent;
        const pricing = {
          link: priceLink ?? "",
          price: price ?? "",
        };

        // Pros and Cons
        const prosElement = el.querySelector('div[aria-label="Pros"]');
        const pros = Array.from(
          prosElement?.querySelectorAll(".text-small-normal .ellipsis-dynamic-wrapper") ?? []
        ).map((el) => el?.textContent ?? "");
        const consElement = el.querySelector('div[aria-label="Cons"]');
        const cons = Array.from(
          consElement?.querySelectorAll(".text-small-normal .ellipsis-dynamic-wrapper") ?? []
        ).map((el) => el?.textContent ?? "");
        const prosAndCons = { pros, cons };

        // User Satisfaction
        const userSatisfactionElement = el.querySelector(
          ".grid-x.grid-margin-x.grid-margin-y.mb-1-small-only"
        );
        const userReviewsElement = userSatisfactionElement?.querySelectorAll(".cell");
        const userReviews = Array.from(userReviewsElement ?? []);
        const userSatisfaction: UserSatisfaction = {
          application: "",
          managed: "",
          nlp: "",
          easeOfAdmin: "",
        };
        const satisfactionTitles: (keyof UserSatisfaction)[] = [
          "application",
          "managed",
          "nlp",
          "easeOfAdmin",
        ];
        for (let i = 0; i < satisfactionTitles.length; i++) {
          const title = satisfactionTitles[i];
          const value = userReviews[i]?.querySelector(
            ".center-center.fw-semibold.text-normal-medium"
          )?.textContent;

          if (value && title) userSatisfaction[title] = value;
        }

        return { name, image, description, details, pricing, prosAndCons, userSatisfaction };
      });

      return products;
    });

    // Debugging and Logging
    // console.log(`Page ${currentPage} has ${productsOnPage.length} products`);
    // console.log({ URL });
    // console.log("--------------------------------");

    if (productsOnPage.length === 0) break;

    allProducts.push(...productsOnPage);
  }

  await browser.close();

  // save JSON to file
  // fs.writeFileSync("index.json", JSON.stringify(allProducts));

  return allProducts;
}

const categoryWinnerSchema = z.object({
  name: z.string(),
  reason: z.string(),
});
const analysisSchema = z.object({
  bestFor: z.object({
    overall: categoryWinnerSchema,
    enterprise: categoryWinnerSchema,
    value: categoryWinnerSchema,
  }),
  productSummaries: z.array(
    z.object({
      name: z.string(),
      summary: z.string(),
    })
  ),
  summary: z.string(),
});

async function parseProducts(allProducts: ScrapedData[]) {
  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: analysisSchema,
    prompt: `${JSON.stringify(allProducts)}
  Given product data in JSON, provide a summary in the following categories: Best for Enterprise, Best Value for Money, and Best Overall. Choose one clear winner in each category and include a rationale. Put this in an object with the key "bestFor" and the value as an object with the keys "overall", "enterprise", and "value". The value of each key is an object with the keys "name" and "reason".

For each product, write a one-line summary and organize these in an array of objects. Put this in an object with the key "productSummaries".

Return the complete structured JSON.
Use the real name of the product and all other details as it is from the JSON provided.
`,
  });

  return object;
}

async function main() {
  // Scrape all products
  const allProducts = await scrapeProducts();

  // Save to all products database
  const productIds = await db
    .insert(products)
    .values({
      category: CATEGORY,
      scrapedData: allProducts,
    })
    .returning({ id: products.id });
  const productId = productIds[0]?.id ?? "";

  if (!productId) throw new Error("No product ID found");

  // LLM Parsing
  const parsedData = await parseProducts(allProducts);

  // Save to parsed products database
  await db.insert(parsedProducts).values({
    category: CATEGORY,
    parsedData,
    productId,
  });
  await db.$client.end();
}

main().catch((error) => {
  console.error("An error occurred:", error);
  process.exit(1);
});
