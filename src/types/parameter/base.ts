import type { EnvName } from "@source/definitions/env";

export interface BaseParameter<T> {
  applicationName: string;
  getParameter: (envName: EnvName) => T;
}
