import * as Port from "@source/definitions/container-port";
import { Namespace } from "@source/definitions/meta";
import * as k8s from "@source/k8s";

export interface Params {
  name: string;
  hosts: string[];
}

export class Generator {
  public generate(params: Params): k8s.Gateway.Type {
    if (params.hosts.length === 0) {
      throw new Error("Specify one or more hosts.");
      // admission webhook "validation.istio.io" denied the request: configuration is invalid: server config must contain at least one host
    }
    return k8s.Gateway.create({
      metadata: {
        name: params.name,
        namespace: Namespace,
      },
      spec: {
        selector: {
          app: "istio-ingressgateway",
          "app.kubernetes.io/name": "istio-ingressgateway",
          "app.kubernetes.io/part-of": "istio",
        },
        servers: [
          {
            port: {
              number: Port.NodePort.IngressGateway,
              name: "http",
              protocol: "HTTP",
            },
            hosts: params.hosts,
          },
        ],
      },
    });
  }
}
