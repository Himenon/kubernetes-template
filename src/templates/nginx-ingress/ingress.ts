import * as Port from "@source/definitions/container-port";
import { Namespace } from "@source/definitions/meta";
import * as k8s from "@source/k8s";

export interface Params {
  name: string;
}

export class Template {
  /**
   * @see https://kubernetes.io/ja/docs/concepts/services-networking/ingress/
   */
  public generate(params: Params): k8s.Ingress.Type {
    return k8s.Ingress.create({
      metadata: {
        name: params.name,
        namespace: Namespace,
        annotations: {
          "nginx.ingress.kubernetes.io/rewrite-target": "/",
        },
      },
      spec: {
        ingressClassName: "nginx",
        rules: [
          {
            host: "pc.localhost.com",
            http: {
              paths: [
                {
                  path: "/",
                  pathType: "Exact",
                  backend: {
                    service: {
                      name: "pc-web",
                      port: {
                        number: Port.ClusterPort.App,
                      },
                    },
                  },
                },
              ],
            },
          },
          {
            host: "sp.localhost.com",
            http: {
              paths: [
                {
                  path: "/",
                  pathType: "Exact",
                  backend: {
                    service: {
                      name: "sp-web",
                      port: {
                        number: Port.ClusterPort.App,
                      },
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    });
  }
}
