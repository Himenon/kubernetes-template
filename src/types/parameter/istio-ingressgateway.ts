import { BaseParameter } from "./base";

export type GatewayName = "pc-example-com" | "sp-example-com";

export interface InputParams {
  applicationName: string;
}

export type Parameter = BaseParameter<InputParams>;
