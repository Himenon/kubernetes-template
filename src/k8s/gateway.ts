import * as Metadata from "./base/metadata";

export interface Selector {
  [key: string]: string;
}

export interface Port {
  number: number;
  name: string;
  protocol: "HTTP" | "HTTPS" | "GRPC" | "HTTP2" | "MONGO" | "TCP" | "TLS";
  targetPort?: number;
}

export interface Server {
  port: Port;
  bind?: string;
  hosts: string[];
  name?: string;
}

export interface Spec {
  selector: Selector;
  servers: Server[];
}

export interface Params {
  metadata: Metadata.Params;
  spec: Spec;
}

export const create = (params: Params) => {
  return {
    apiVersion: "networking.istio.io/v1alpha3",
    kind: "Gateway",
    metadata: params.metadata,
    spec: params.spec,
  };
};

export type Type = ReturnType<typeof create>;
