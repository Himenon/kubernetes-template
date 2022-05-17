import type { Schemas } from "@himenon/kubernetes-typescript-openapi/v1.18.20";

import * as Metadata from "./base/metadata";
import * as PodTemplate from "./pod-template";

export interface Spec {
  updateStrategy: {
    type: "RollingUpdate";
  };
  selector: {
    matchLabels: Record<string, string>;
  };
  template: PodTemplate.Spec;
}

export interface Params {
  metadata: Metadata.Params;
  spec: Spec;
}

export type Type = Schemas.io$k8s$api$apps$v1$DaemonSet;

export const create = (params: Params): Type => {
  return {
    apiVersion: "apps/v1",
    kind: "DaemonSet",
    metadata: params.metadata,
    spec: {
      ...params.spec,
      template: PodTemplate.create(params.spec.template),
    },
  };
};
