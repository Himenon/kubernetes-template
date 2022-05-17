/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Schemas } from "@himenon/kubernetes-typescript-openapi/v1.18.20";

import * as Metadata from "./base/metadata";

export type Affinity = Schemas.io$k8s$api$core$v1$Affinity;

export type EnvVar = Schemas.io$k8s$api$core$v1$EnvVar;

/**
 * - scaleTargetRefは自動で挿入される（と思う）
 */
export type HorizontalPodAutoscalerSpec = Omit<Schemas.io$k8s$api$autoscaling$v2beta1$HorizontalPodAutoscalerSpec, "scaleTargetRef">;

export type NodeSelectorTerm = Schemas.io$k8s$api$core$v1$NodeSelectorTerm;

export type PodDisruptionBudgetSpec = Schemas.io$k8s$api$policy$v1beta1$PodDisruptionBudgetSpec;

export type ReadinessProbe = Schemas.io$k8s$api$core$v1$Probe;

export type Resources = Schemas.io$k8s$api$core$v1$ResourceRequirements;

export type ServiceSpec = Schemas.io$k8s$api$core$v1$ServiceSpec;

export type DeploymentStrategy = Schemas.io$k8s$api$apps$v1$DeploymentStrategy;

export type Toleration = Schemas.io$k8s$api$core$v1$Toleration;

export type PodSecurityContext = Schemas.io$k8s$api$core$v1$PodSecurityContext;

export type Volume = Schemas.io$k8s$api$core$v1$Volume;

export type VolumeMount = Schemas.io$k8s$api$core$v1$VolumeMount;

export interface K8SObjectOverlay_PathValue {
  path?: string;
  value?: any;
}

export interface K8SObjectOverlay {
  apiVersion?: string;
  kind?: string;
  name?: string;
  patches?: K8SObjectOverlay_PathValue[];
}

/**
 * @see https://github.com/istio/api/blob/master/operator/v1alpha1/operator.pb.go#L711
 */
export interface KubernetesResourcesSpec {
  affinity?: Affinity;
  env?: EnvVar[];
  hpaSpec?: HorizontalPodAutoscalerSpec;
  imagePullPolicy?: string;
  nodeSelector?: Record<string, string>;
  podDisruptionBudget?: PodDisruptionBudgetSpec;
  podAnnotations?: Record<string, string>;
  priorityClassName?: string;
  readinessProbe?: ReadinessProbe;
  replicaCount?: number;
  resources?: Resources;
  service?: ServiceSpec;
  strategy?: DeploymentStrategy;
  tolerations?: Toleration[];
  serviceAnnotations?: Record<string, string>;
  securityContext?: PodSecurityContext;
  volumes?: Volume[];
  volumeMounts?: VolumeMount[];
  overlays?: K8SObjectOverlay[];
}

/**
 * @see https://github.com/istio/api/blob/master/operator/v1alpha1/operator.pb.go#L629
 */
export interface GatewaySpec {
  enabled?: boolean;
  namespace?: string;
  name?: string;
  label?: Record<string, string>;
  hub?: string;
  tag?: any;
  k8s?: KubernetesResourcesSpec;
}

export interface BaseComponentSpec {
  enabled?: boolean;
  k8s?: KubernetesResourcesSpec;
}

export interface ComponentSpec {
  enabled?: boolean;
  namespace?: string;
  hub?: string;
  tag?: any;
  spec?: any;
  k8s?: KubernetesResourcesSpec;
}

export interface IstioComponentSetSpec {
  base?: BaseComponentSpec;
  pilot?: ComponentSpec;
  cni?: ComponentSpec;
  istiodRemote?: ComponentSpec;
  ingressGateways?: GatewaySpec[];
  egressGateways?: GatewaySpec[];
}

export interface ExternalComponentSpec {
  enabled?: boolean;
  namespace?: string;
  spec?: any;
  chartPath?: string;
  schema?: any;
  k8s?: KubernetesResourcesSpec;
}

export interface Spec {
  profile: string;
  hub?: string;
  tag?: any;
  resourceSuffix?: string;
  namespace?: string;
  revision?: string;
  defaultRevision?: string;
  meshConfig?: Record<string, any>;
  components?: IstioComponentSetSpec;
  addonComponents?: Record<string, ExternalComponentSpec>;
  values?: Record<string, any>;
  unvalidatedValues?: string;
}

export interface Params {
  metadata: Metadata.Params;
  spec: Spec;
}

/**
 * apiVersion: install.istio.io/v1alpha1
 */
export const create = (params: Params) => {
  return {
    apiVersion: "install.istio.io/v1alpha1",
    kind: "IstioOperator",
    metadata: params.metadata,
    spec: params.spec,
  };
};

export type Type = ReturnType<typeof create>;
