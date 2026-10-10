import { Product } from "../orders/models";

export namespace ProductCache {
  const cache = new Map<number, Product>();

  export const get = (id: number): Product | undefined => {
    return cache.get(id);
  };

  export const set = (id: number, product: Product): void => {
    cache.set(id, product);
  };

  export const has = (id: number): boolean => {
    return cache.has(id);
  };

  export const clear = (): void => {
    cache.clear();
  };
}
