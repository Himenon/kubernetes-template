export interface Params {
  resources: string[];
  patchesStrategicMerge?: string[];
}

export const create = (params: Params) => {
  return {
    apiVersion: "kustomize.config.k8s.io/v1beta1",
    kind: "Kustomization",
    resources: params.resources,
    patchesStrategicMerge: params.patchesStrategicMerge,
  };
};

export type Type = ReturnType<typeof create>;
