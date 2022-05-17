import * as Metadata from "./base/metadata";

export interface PortSelector {
  number: number;
  name: "http" | "tcp" | "https" | "grpc";
  protocol: "HTTP" | "HTTPS" | "GRPC" | "HTTP2" | "MONGO" | "TCP" | "TLS";
}

export interface Spec {
  hosts: string[];
  location: "MESH_EXTERNAL" | "MESH_INTERNAL";
  ports: PortSelector[];
  resolution?: "DNS";
}

export interface Params {
  metadata: Metadata.Params;
  spec: Spec;
}

export const create = (params: Params) => {
  return {
    apiVersion: "networking.istio.io/v1beta1",
    kind: "ServiceEntry",
    ...params,
  };
};

export type Type = ReturnType<typeof create>;
