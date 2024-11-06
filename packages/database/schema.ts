import { jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export interface Details {
  users?: (string | undefined)[];
  industries?: (string | undefined)[];
  marketSegment?: (string | undefined)[];
}
interface Pricing {
  link: string;
  price: string;
}
interface ProsAndCons {
  pros: string[];
  cons: string[];
}
export interface UserSatisfaction {
  application: string;
  managed: string;
  nlp: string;
  easeOfAdmin: string;
}
export interface ScrapedData {
  name: string;
  description: string;
  image: string;
  details: Details;
  pricing: Pricing;
  prosAndCons: ProsAndCons;
  userSatisfaction: UserSatisfaction;
}

type ParsedData = {
  summary: string;
  bestFor: {
    value: {
      name: string;
      reason: string;
    };
    overall: {
      name: string;
      reason: string;
    };
    enterprise: {
      name: string;
      reason: string;
    };
  };
  productSummaries: {
    summary: string;
    name: string;
  }[];
};

export const products = pgTable("products", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  category: text("category").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  scrapedData: jsonb("scraped_data").$type<ScrapedData[]>().notNull(),
});

export const parsedProducts = pgTable("parsed_products", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  productId: varchar("product_id")
    .references(() => products.id)
    .notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  parsedData: jsonb("parsed_data").$type<ParsedData>().notNull(),
});

export const parsedProductsRelations = relations(parsedProducts, ({ one }) => ({
  product: one(products, {
    fields: [parsedProducts.productId],
    references: [products.id],
  }),
}));
