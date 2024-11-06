import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { products } from "./schema";

export type Product = InferSelectModel<typeof products>;

export type NewProduct = InferInsertModel<typeof products>;
