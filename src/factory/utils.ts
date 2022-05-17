import type * as Base from "@source/types/factory";
import { createHash } from "crypto";

const filtering = (items: Base.Item[]): Base.Item[] => {
  return items.filter((item) => {
    if ("children" in item) {
      return !!item["children"];
    } else if ("value" in item) {
      return !!item["value"];
    }
    return false;
  });
};

export const formatItems = (items: Base.Item[]): Base.Item[] => {
  return filtering(items);
};

export const createContentHash = (inputText: string): string => {
  const hash = createHash("md4");
  hash.update(inputText);
  return hash.digest("hex");
};
