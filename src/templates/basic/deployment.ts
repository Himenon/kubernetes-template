import { applicationPartOf, Namespace } from "@source/definitions/meta";
import * as k8s from "@source/k8s";

export interface Params {
  applicationName: string;
  replicas: number;
  podTemplate: k8s.PodTemplate.Spec;
}

export class Template {
  public generate(params: Params): k8s.Deployment.Type {
    return k8s.Deployment.create({
      metadata: {
        name: params.applicationName,
        namespace: Namespace,
        labels: {
          app: params.applicationName,
          "app.kubernetes.io/name": params.applicationName,
          "app.kubernetes.io/part-of": applicationPartOf,
        },
        annotations: {},
      },
      spec: {
        replicas: params.replicas,
        revisionHistoryLimit: 2,
        minReadySeconds: 10,
        selector: {
          matchLabels: {
            "app.kubernetes.io/name": params.applicationName,
            "app.kubernetes.io/part-of": applicationPartOf,
          },
        },
        strategy: {
          type: "RollingUpdate",
          rollingUpdate: {
            maxSurge: Math.ceil(params.replicas * 0.25),
            maxUnavailable: 0,
          },
        },
        template: params.podTemplate,
      },
    });
  }
}
