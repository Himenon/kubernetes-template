import type { EnvName } from "@source/definitions/env";
import type * as Base from "@source/types/factory";
import type { Parameter } from "@source/types/parameter/istio-ingressgateway";

import { formatItems } from "../utils";
import { Resource } from "./resource";

export class Factory implements Base.RootFactory {
  private readonly resource: Resource;
  public readonly directoryName: string;
  constructor(env: EnvName, parameter: Parameter) {
    const params = parameter.getParameter(env);
    this.directoryName = parameter.applicationName;
    this.resource = new Resource(params);
  }
  private getItems(): Base.Item[] {
    return [
      {
        name: "istio-operator",
        value: this.resource.istioOperator,
      },
      {
        name: "gateway-pc",
        value: this.resource.gatewayPc,
      },
      {
        name: "gateway-sp",
        value: this.resource.gatewaySp,
      },
    ];
  }
  public create(): Base.Item[] {
    return formatItems(this.getItems());
  }
}
