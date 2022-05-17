import * as yaml from "js-yaml";
import { EOL } from "os";
import * as prettier from "prettier";
import * as pureYaml from "yaml";

export const DO_NOT_EDIT_COMMENT = [
  "## AUTO GENERATED",
].join(EOL);

export const stringify_v1 = (value: unknown): string => yaml.dump(value, { noRefs: true, lineWidth: 144 });
export const stringify_v2 = (value: unknown): string => pureYaml.stringify(value, { maxAliasCount: -1, merge: true });

export const stringifyYaml = (source: unknown, version: "v1" | "v2" = "v1"): string => {
  const stringify = version === "v1" ? stringify_v1 : stringify_v2;
  const formatSource = prettier.format(DO_NOT_EDIT_COMMENT + EOL + stringify(source), { parser: "yaml", printWidth: 144 });
  return formatSource;
};

export const compareBasename = (a: string, b: string): 0 | -1 | 1 => {
  if (a.toLowerCase() < b.toLowerCase()) {
    return -1;
  }
  if (a.toLowerCase() > b.toLowerCase()) {
    return 1;
  }
  return 0;
};

export const sortAlphabetalize = (list: string[]): string[] => {
  return list.sort(compareBasename);
};
