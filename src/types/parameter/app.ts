import type * as k8s from "@source/k8s";
import { GatewayName } from "@source/types/parameter/istio-ingressgateway";

import { BaseParameter } from "./base";

export interface TokenBucket {
  max_tokens: number;
  tokens_per_fill: number;
  fill_interval: string;
}
export interface LimitRequestZone {
  name: string;
  size: string;
  key?: string;
  rate: string;
}

export interface LimitRequest {
  zoneName: string;
  burst: number;
  delay: number;
}

export interface Location {
  path: string;
  limitReq?: LimitRequest;
  others?: Record<string, string>;
}

export interface NginxConf {
  name: string;
  limitReqZones?: LimitRequestZone[];
  locations: Location[];
}

export interface InputParams {
  applicationName: string;
  applicationActiveVersion: string;
  replicas?: number;
  gatewayName: GatewayName;
  imageName: string;
  httpMatchRequests: k8s.VirtualService.HTTPMatchRequest[];
  env: k8s.PodTemplate.Env[];
  envFrom?: k8s.PodTemplate.EnvFrom[];
  resources?: k8s.PodTemplate.Resources;
  volumeMounts?: k8s.PodTemplate.VolumeMount[];
  volumes?: k8s.PodTemplate.Volume[];
  nodeKind?: k8s.PodTemplate.NodeKind;
  probeThreshold?: {
    failureThreshold: number;
    timeoutSeconds: number;
  };
  hpa?: {
    minReplicas?: number;
    maxReplicas: number;
    triggerCPUUsage?: number;
  };
  /** use istio-proxy */
  localRatelimit?: {
    tokenBucket: TokenBucket;
  };
  sidecarNginxConf?: NginxConf;
  notificationSlackChannel: string;
}

export type Parameter = BaseParameter<InputParams>;
