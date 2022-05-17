import * as Port from "@source/definitions/container-port";
import { Namespace } from "@source/definitions/meta";
import { applicationPartOf } from "@source/definitions/meta";
import * as k8s from "@source/k8s";

export interface Params {
  name: string;
  applicationName: string;
}

export class Template {
  private getPorts(params: Params): k8s.Service.Port[] {
    const ports = [
      {
        name: `http-${params.applicationName}-svc`,
        port: Port.ClusterPort.App,
        targetPort: Port.ClusterPort.App,
      },
    ];
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
