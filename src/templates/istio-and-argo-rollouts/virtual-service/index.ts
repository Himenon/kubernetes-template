import { Namespace } from "@source/definitions/meta";
import * as k8s from "@source/k8s";

import * as HttpRoute from "./http-route";

export { HttpRoute };

export interface Params {
  applicationName: string;
  gatewayName: string;
  http: k8s.VirtualService.HttpRoute[];
}

export class Template {
  public httpRoute: HttpRoute.Generator = new HttpRoute.Generator();
  public generate(params: Params): k8s.VirtualService.Type {
    return k8s.VirtualService.create({
      metadata: {
        name: params.applicationName,
        namespace: Namespace,
      },
      spec: {
        gateways: [params.gatewayName],
        hosts: ["*"],
        http: params.http,
      },
    });
  }
}
