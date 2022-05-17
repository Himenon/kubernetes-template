import { BaseParameter } from "./base";

export interface InputParams {
  applicationName: string;
}

export type Parameter = BaseParameter<InputParams>;
