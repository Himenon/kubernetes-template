import type { EnvName } from "@source/definitions/env";
import type * as Base from "@source/types/factory";
import type { Parameter } from "@source/types/parameter/nginx-ingress";

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
        name: "ingress",
        value: this.resource.ingress,
      },
    ];
  }
  public create(): Base.Item[] {
    return formatItems(this.getItems());
  }
}
