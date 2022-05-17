import * as k8s from "@source/k8s";

import * as Route from "./route";

export interface Params {
  applicationName: string;
  httpMatchRequests: k8s.VirtualService.HTTPMatchRequest[];
  useSidecar: boolean;
}

export class Generator {
  private route = new Route.Generator();
  public generateUsingRolloutHttpRoutes(params: Params): k8s.VirtualService.HttpRoute[] {
    return [
      {
        name: `http-${params.applicationName}-primary`,
        match: params.httpMatchRequests,
        route: this.route.generateRollout(params),
      },
    ].filter((httpRoute): httpRoute is k8s.VirtualService.HttpRoute => !!httpRoute);
  }
}
