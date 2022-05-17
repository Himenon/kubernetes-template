import type { Schemas } from "@himenon/kubernetes-typescript-openapi/v1.18.20";

import * as Metadata from "./base/metadata";
import * as PodTemplate from "./pod-template";

export interface Spec extends Schemas.io$k8s$api$apps$v1$DeploymentSpec {
  replicas: number;
  revisionHistoryLimit: number;
  selector: {
    matchLabels: {
      "app.kubernetes.io/name": string;
      "app.kubernetes.io/part-of": string;
    };
  };
  strategy?: Schemas.io$k8s$api$apps$v1$DeploymentStrategy;
  template: PodTemplate.Spec;
}

export interface Params {
  metadata: Metadata.Params;
  spec: Spec;
}

export type Type = Schemas.io$k8s$api$apps$v1$Deployment;

export const create = (params: Params): Type => {
  return {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: params.metadata,
    spec: {
      ...params.spec,
      template: PodTemplate.create(params.spec.template),
    },
  };
};
