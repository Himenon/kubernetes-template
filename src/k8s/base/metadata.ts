import type { Schemas } from "@himenon/kubernetes-typescript-openapi/v1.18.20";

export interface Params {
  name: string;
  namespace: string;
  labels?: { [key: string]: string };
  annotations?: { [key: string]: string };
}

export type Type = Schemas.io$k8s$apimachinery$pkg$apis$meta$v1$ObjectMeta;

export const create = (params: Params): Type => {
  return {
    name: params.name,
    namespace: params.namespace,
  };
};
