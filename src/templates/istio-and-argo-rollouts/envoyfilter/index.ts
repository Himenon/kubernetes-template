import * as k8s from "@source/k8s";

import * as Compressor from "./compressor";
import * as LocalRatelimit from "./local-ratelimit";

export interface Params {
  applicationName: string;
  gatewayName: string;
  http: k8s.VirtualService.HttpRoute[];
}

export class Template {
  public readonly localRatelimit = new LocalRatelimit.Generator();
  public readonly compressor = new Compressor.Generator();
}
