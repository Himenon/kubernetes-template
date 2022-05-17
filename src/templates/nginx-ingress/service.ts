import * as Port from "@source/definitions/container-port";
import { Namespace } from "@source/definitions/meta";
import { applicationPartOf } from "@source/definitions/meta";
import * as k8s from "@source/k8s";

export interface Params {
  name: string;
  applicationName: string;
}

export class Template {
  public generateNodePortService(params: Params): k8s.Service.Type {
    return k8s.Service.create({
      metadata: {
        name: params.name,
        namespace: Namespace,
      },
      spec: {
        type: "NodePort",
        selector: {
          app: params.applicationName,
          "app.kubernetes.io/name": params.applicationName,
          "app.kubernetes.io/part-of": applicationPartOf,
        },
        ports: [
          {
            name: `http-${params.applicationName}-svc`,
            nodePort: Port.NodePort.IngressGateway,
            port: Port.NodePort.IngressGateway,
            targetPort: Port.ClusterPort.App,
          },
        ],
      },
    });
  }
}
