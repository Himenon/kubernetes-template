import type { Schemas } from "@himenon/kubernetes-typescript-openapi/v1.18.20";

import * as Metadata from "./base/metadata";

export interface Port {
  name?: string;
  port: number;
  targetPort: number;
  protocol?: string;
  nodePort?: number;
}

export interface Selector {
  [key: string]: string;
}

export interface DefaultSelector {
  app: string;
  "app.kubernetes.io/name": string;
  "app.kubernetes.io/part-of": string;
  [key: string]: string;
}

export interface Spec<S = DefaultSelector> {
  /**
   * 実際はoptionalだが、保守しやすいように明示的に使う
   */
  type: "ClusterIP" | "NodePort" | "ExternalName" | undefined;
  clusterIP?: "None" | string;
  selector?: S;
  ports: Port[];
  /**
   * Nodeに到達した通信を他のNodeのPodに対してバランスするか指定するServiceのオプション
   * （istioのオプションではない）
   *
   * デフォルト（未指定）はClusterになる。
   *
   * Local   : 到達したNodeのPodに通信を割り当てる
   * Cluster : 到達したNodeから更に別のNodeのPodにも通信を割り当てる
   */
  externalTrafficPolicy?: "Local" | "Cluster";
}

export interface Params<S = DefaultSelector> {
  metadata: Metadata.Params;
  spec: Spec<S>;
}

export type Type = Schemas.io$k8s$api$core$v1$Service;

export const create = <S extends Selector = DefaultSelector>(params: Params<S>): Type => {
  return {
    apiVersion: "v1",
    kind: "Service",
    metadata: params.metadata,
    spec: params.spec,
  };
};
