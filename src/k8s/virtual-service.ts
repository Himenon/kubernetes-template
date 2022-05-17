import * as Metadata from "./base/metadata";

/**
 * @see https://istio.io/latest/docs/reference/config/networking/virtual-service/#HTTPMatchRequest
 */
export interface StringMatch {
  exact?: string;
  prefix?: string;
  regex?: string;
}

export interface HTTPMatchRequest {
  name?: string;
  uri: StringMatch;
  queryParams?: Record<string, Omit<StringMatch, "prefix">>;
}

/**
 * @see https://istio.io/latest/docs/reference/config/networking/virtual-service/#HTTPRedirect
 */
export interface HTTPRedirect {
  uri?: string;
  authority?: string;
  redirectCode?: number;
}

export interface PortSelector {
  number: number;
}

export interface Destination {
  host: string;
  subset?: string;
  port: PortSelector;
}

export interface HTTPRouteDestination {
  destination: Destination;
  weight?: number;
  headers?: Record<string, unknown>;
}

export interface HTTPRewrite {
  uri: string;
  authority?: string;
}

/**
 * @see https://istio.io/latest/docs/reference/config/networking/virtual-service/#HTTPRoute
 */
export interface HttpRoute {
  name: string;
  match: HTTPMatchRequest[];
  route: HTTPRouteDestination[];
  redirect?: HTTPRedirect;
  rewrite?: HTTPRewrite;
}

export interface Spec {
  hosts: string[];
  gateways: string[];
  http: HttpRoute[];
}

export interface Params {
  metadata: Metadata.Params;
  spec: Spec;
}

export const create = (params: Params) => {
  return {
    apiVersion: "networking.istio.io/v1beta1",
    kind: "VirtualService",
    ...params,
  };
};

export type Type = ReturnType<typeof create>;
