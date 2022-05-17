import * as Port from "@source/definitions/container-port";
import { Namespace } from "@source/definitions/meta";
import { applicationPartOf } from "@source/definitions/meta";
import * as k8s from "@source/k8s";

export interface Params {
  name: string;
  applicationName: string;
  sidecarName?: string;
}

export class Template {
  public generateHeadlessService({ name, targetPorts }: { name: string; targetPorts: number[] }): k8s.Service.Type {
    const portObjects = targetPorts.map<k8s.Service.Port>((targetPort) => {
      return {
        port: Port.ClusterPort.App,
        targetPort: targetPort,
      };
    });
    return k8s.Service.create({
      metadata: {
        name: name,
        namespace: Namespace,
      },
      spec: {
        type: undefined,
        clusterIP: "None",
        ports: portObjects,
      },
    });
  }

  private getPorts(params: Params): k8s.Service.Port[] {
    const ports = [
      {
        name: `http-${params.applicationName}-svc`,
        port: Port.ClusterPort.App,
        targetPort: Port.ClusterPort.App,
      },
    ];
    if (params.sidecarName) {
      ports.push({
        name: `http-${params.sidecarName}-svc`,
        port: Port.ClusterPort.Sidecar,
        targetPort: Port.ClusterPort.Sidecar,
      });
    }
    return ports;
  }

  public generateClusterIpService(params: Params): k8s.Service.Type {
    return k8s.Service.create({
      metadata: {
        name: params.name,
        namespace: Namespace,
      },
      spec: {
        type: "ClusterIP",
        selector: {
          app: params.applicationName,
          "app.kubernetes.io/name": params.applicationName,
          "app.kubernetes.io/part-of": applicationPartOf,
        },
        ports: this.getPorts(params),
      },
    });
  }
}
