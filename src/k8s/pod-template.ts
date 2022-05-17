import type { Schemas } from "@himenon/kubernetes-typescript-openapi/v1.18.20";

export type SecurityContext = Schemas.io$k8s$api$core$v1$SecurityContext;

export type EnvFrom = Schemas.io$k8s$api$core$v1$EnvFromSource;

export type Env = Schemas.io$k8s$api$core$v1$EnvVar;

export interface Port {
  containerPort: number;
  name?: string;
}

export interface Resources {
  limits: {
    cpu?: string;
    memory?: string;
  };
  requests: {
    cpu?: string;
    memory?: string;
  };
}

export interface VolumeMount {
  name: string;
  mountPath: string;
  readOnly?: true;
}

/**
 * Nodeをどのクラスタに立てるかを示す識別子.
 * ingress-gatewayなどを除いては基本的にworkerを利用する.
 */
export type NodeKind = "worker" | "gateway";

export interface NodeSelector {
  [key: string]: NodeKind;
}

export type Volume = Schemas.io$k8s$api$core$v1$Volume;

export interface Toleration {
  key?: "node-role.kubernetes.io/master" | string;
  operator: "Exists";
  effect: "NoExecute" | "NoSchedule";
}

export type Container = Schemas.io$k8s$api$core$v1$Container;

export type WeightedPodAffinityTerm = Schemas.io$k8s$api$core$v1$WeightedPodAffinityTerm;

export type Affinity = Schemas.io$k8s$api$core$v1$Affinity;

export interface Spec {
  metadata: {
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
  };
  containers: Container[];
  imagePullSecrets: { name: string }[];
  terminationGracePeriodSeconds?: number;
  volumes?: Volume[];
  tolerations?: Toleration[];
  serviceAccountName?: string;
  nodeSelector?: Record<string, string>;
  affinity?: Affinity;
  restartPolicy?: "Never" | "OnFailure";
}

export type Type = Schemas.io$k8s$api$core$v1$PodTemplateSpec;

export const create = (params: Spec): Type => {
  return {
    metadata: params.metadata,
    spec: {
      containers: params.containers,
      terminationGracePeriodSeconds: params.terminationGracePeriodSeconds,
      volumes: params.volumes,
      imagePullSecrets: params.imagePullSecrets,
      serviceAccountName: params.serviceAccountName,
      tolerations: params.tolerations,
      nodeSelector: params.nodeSelector,
      affinity: params.affinity,
    },
  };
};
