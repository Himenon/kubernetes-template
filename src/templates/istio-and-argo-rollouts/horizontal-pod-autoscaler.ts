import { Namespace } from "@source/definitions/meta";
import * as k8s from "@source/k8s";

export interface Params {
  name: string;
  spec: k8s.HorizontalPodAutoscaler.Spec;
}

export class Template {
  public generate(params: Params): k8s.HorizontalPodAutoscaler.Type {
    return k8s.HorizontalPodAutoscaler.create({
      metadata: {
        name: params.name,
        namespace: Namespace,
      },
      spec: params.spec,
    });
  }
}
