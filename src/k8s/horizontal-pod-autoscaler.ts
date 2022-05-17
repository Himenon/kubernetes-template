import type { Schemas } from "@himenon/kubernetes-typescript-openapi/v1.18.20";

import * as Metadata from "./base/metadata";

export type Spec = Schemas.io$k8s$api$autoscaling$v2beta2$HorizontalPodAutoscalerSpec;

export interface Params {
  metadata: Metadata.Params;
  spec: Spec;
}

export type Type = Schemas.io$k8s$api$autoscaling$v2beta2$HorizontalPodAutoscaler;

export const create = (params: Params): Type => {
  return {
    apiVersion: "autoscaling/v2beta2",
    kind: "HorizontalPodAutoscaler",
    metadata: params.metadata,
    spec: {
      ...params.spec,
    },
  };
};
