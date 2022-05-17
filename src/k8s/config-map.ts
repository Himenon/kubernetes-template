import type { Schemas } from "@himenon/kubernetes-typescript-openapi/v1.18.20";

import * as Metadata from "./base/metadata";

export interface Params {
  metadata: Metadata.Params;
  data: Record<string, string>;
}

export type Type = Schemas.io$k8s$api$core$v1$ConfigMap;

export const create = (params: Params): Type => {
  return {
    apiVersion: "v1",
    kind: "ConfigMap",
    metadata: params.metadata,
    data: params.data,
  };
};
