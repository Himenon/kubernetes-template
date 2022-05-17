import * as Port from "@source/definitions/container-port";
import { Namespace } from "@source/definitions/meta";
import * as k8s from "@source/k8s";

export interface Cluster {
  applicationName: string;
  weight: number;
}

export interface Params {
  applicationName: string;
  httpMatchRequests: k8s.VirtualService.HTTPMatchRequest[];
  useSidecar: boolean;
}

export class Generator {
  private getServicePort(useSidecar: boolean): number {
    if (useSidecar) {
      return Port.ClusterPort.Sidecar;
    }
    return Port.ClusterPort.App;
  }
  public generateRollout(params: Params): k8s.VirtualService.HTTPRouteDestination[] {
    return [
      {
        destination: {
          host: `${params.applicationName}-primary.${Namespace}.svc.cluster.local`,
          port: {
            number: this.getServicePort(params.useSidecar),
          },
        },
        weight: 100,
      },
      {
        destination: {
          host: `${params.applicationName}-secondary.${Namespace}.svc.cluster.local`,
          port: {
            number: this.getServicePort(params.useSidecar),
          },
        },
        weight: 0,
      },
    ];
  }
}
