import type { EnvName } from "@source/definitions/env";
import type * as Base from "@source/types/factory";
import type { Parameter } from "@source/types/parameter/app";

import { formatItems } from "../utils";
import { Resource as ArgoRolloutResource } from "./argo-rollout-resource";
import * as Nginx from "./nginx";
import { Resource } from "./resource";

export class Factory implements Base.RootFactory {
  private nginx: Nginx.Factory;
  private readonly resource: Resource;
  private readonly argoRolloutResource: ArgoRolloutResource;
  public readonly directoryName: string;
  constructor(env: EnvName, parameter: Parameter) {
    const params = parameter.getParameter(env);
    this.directoryName = parameter.applicationName;
    this.resource = new Resource(params);
    this.argoRolloutResource = new ArgoRolloutResource(params);
    this.nginx = new Nginx.Factory(this.resource.nginx);
  }
  private getItems(): Base.Item[] {
    return [
      {
        name: "virtual-service",
        value: this.argoRolloutResource.virtualService,
      },
      {
        name: "rollout",
        value: this.argoRolloutResource.rollout,
      },
      {
        name: "service-primary",
        value: this.argoRolloutResource.primaryService,
      },
      {
        name: "service-secondary",
        value: this.argoRolloutResource.secondaryService,
      },
      {
        name: "hpa",
        value: this.argoRolloutResource.hpa,
      },
      {
        name: "response-compressor",
        value: this.resource.compressor,
      },
      {
        name: "local-ratelimit",
        value: this.resource.localRatelimit,
      },
      {
        name: "nginx",
        children: this.nginx,
      },
    ];
  }
  public create(): Base.Item[] {
    return formatItems(this.getItems());
  }
}
