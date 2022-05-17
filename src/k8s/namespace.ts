import type { Schemas } from "@himenon/kubernetes-typescript-openapi/v1.18.20";

import * as Metadata from "./base/metadata";

export interface Params {
  metadata: Omit<Metadata.Params, "namespace">;
}
export type Type = Schemas.io$k8s$api$core$v1$Namespace;

export const create = (params: Params): Type => {
  return {
    apiVersion: "v1",
    kind: "Namespace",
    metadata: params.metadata,
  };
};
