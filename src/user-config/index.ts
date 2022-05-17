import type { EnvConfig } from "@source/definitions/env";
import * as fs from "fs";
import { z } from "zod";

const ZodUnitConfig = z.object({
  appVersion: z.string(),
  replicas: z.number(),
});

export type UnitConfigType = z.infer<typeof ZodUnitConfig>;

const ZodEnvConfig = z.object({
  dev: ZodUnitConfig,
  stage: ZodUnitConfig,
  qa: ZodUnitConfig,
  production: ZodUnitConfig,
});

export type EnvConfigType = z.infer<typeof ZodEnvConfig>;

export const getUserConfig = (target: string): EnvConfig<UnitConfigType> => {
  const data = JSON.parse(fs.readFileSync(`./config/${target}.json`, "utf-8"));
  const parsedUserData = ZodEnvConfig.safeParse(data);
  if (parsedUserData.success) {
    return parsedUserData.data;
  }
  throw parsedUserData.error;
};
