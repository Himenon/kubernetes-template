import type { Schemas } from "@himenon/kubernetes-typescript-openapi/v1.18.20";

import * as Metadata from "./base/metadata";
import * as Formatter from "./formatter";
import * as PodTemplate from "./pod-template";

export interface Spec extends Schemas.io$k8s$api$batch$v1$JobSpec {
  template: PodTemplate.Spec;
}

export interface Params {
  metadata: Metadata.Params;
  spec: Spec;
}

export type Type = Schemas.io$k8s$api$batch$v1$Job;

export const create = (params: Params): Type => {
  return {
    apiVersion: "batch/v1",
    kind: "Job",
    metadata: {
      ...params.metadata,
      name: Formatter.cutStringTo63CharactersOrLess(params.metadata.name, true),
    },
    spec: {
      ...params.spec,
      template: {
        metadata: params.spec.template.metadata,
        spec: {
          containers: params.spec.template.containers,
          restartPolicy: params.spec.template.restartPolicy,
          imagePullSecrets: params.spec.template.imagePullSecrets,
          nodeSelector: params.spec.template.nodeSelector,
        },
      },
    },
  };
};
