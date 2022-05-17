import type { Schemas } from "@himenon/kubernetes-typescript-openapi/v1.22.3";

import * as Metadata from "./base/metadata";
import * as Formatter from "./formatter";

export interface Spec extends Schemas.io$k8s$api$networking$v1$IngressSpec {}

export interface Params {
  metadata: Metadata.Params;
  spec: Spec;
}

export type Type = Schemas.io$k8s$api$networking$v1$Ingress;

export const create = (params: Params): Type => {
  return {
    apiVersion: "networking.k8s.io/v1",
    kind: "Ingress",
    metadata: {
      ...params.metadata,
      name: Formatter.cutStringTo63CharactersOrLess(params.metadata.name, true),
    },
    spec: params.spec,
  };
};
