import type { Schemas } from "@himenon/kubernetes-typescript-openapi/v1.18.20";

import * as Metadata from "./base/metadata";

export interface Address {
  ip: string;
}

export type Addresses = Address[];

export interface Port {
  port: number;
}

export type Ports = Port[];

export interface Subset {
  addresses: Addresses;
  ports: Ports;
}

export type Subsets = Subset[];

export interface Params {
  metadata: Metadata.Params;
  subsets: Subsets;
}
export type Type = Schemas.io$k8s$api$core$v1$Endpoints;

export const create = (params: Params): Type => {
  return {
    apiVersion: "v1",
    kind: "Endpoints",
    metadata: params.metadata,
    subsets: params.subsets,
  };
};
