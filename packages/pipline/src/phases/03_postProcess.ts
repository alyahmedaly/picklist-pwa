import type { Product } from "@picklist/types";
import { canonicalOrderProducts } from "../utils/ordering.ts";

export function postProcessProducts(products: Product[]) {
      products = canonicalOrderProducts(products);

    return products;
}