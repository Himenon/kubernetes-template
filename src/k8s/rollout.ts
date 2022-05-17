import type { Schemas } from "@himenon/argo-rollouts-typescript-openapi/v1.2.0";

import type * as Metadata from "./base/metadata";
import * as PodTemplate from "./pod-template";

export namespace Strategy {
  export interface TrafficRourting {
    istio?: Schemas.github$com$argoproj$argo_rollouts$pkg$apis$rollouts$v1alpha1$IstioTrafficRouting;
  }
  export type BlueGreen = Schemas.github$com$argoproj$argo_rollouts$pkg$apis$rollouts$v1alpha1$BlueGreenStrategy & {
    maxUnavailable?: string | number;
    /** minimum: 30  */
    scaleDownDelaySeconds?: number;
    /** Defaults to nil  */
    scaleDownDelayRevisionLimit?: number;
    /** default 30 */
    abortScaleDownDelaySeconds?: number;
  };

  export type Step = Schemas.github$com$argoproj$argo_rollouts$pkg$apis$rollouts$v1alpha1$CanaryStep;


  type BaseCanaryStrategy = Schemas.github$com$argoproj$argo_rollouts$pkg$apis$rollouts$v1alpha1$CanaryStrategy;

  export interface Canary extends Omit<BaseCanaryStrategy, "maxUnavailable" | "maxSurge"> {
    /**
     * @see https://github.com/argoproj/argo-rollouts/issues/430
     *
     * 更新中に使用できなくなる可能性のあるポッドの最大数
     * MaxSurgeが0の場合、これを0にすることはできません。
     *
     * Default: "25%".
     */
    maxUnavailable?: string | number;
    /**
     * @see https://github.com/argoproj/argo-rollouts/issues/430
     *
     * maxSurgeは、最後のsetWeightによって設定された正しい比率に移行するために、
     * ロールアウトが作成できるレプリカの最大数を定義します。
     * Max Surgeには、整数またはパーセンテージの文字列を指定できます
     *
     * Defaults "25%"
     */
    maxSurge?: string | number;
  }

  export interface BlueGreenObject {
    canary: undefined;
    blueGreen: Strategy.BlueGreen;
  }

  export interface CanaryObject {
    canary: Strategy.Canary;
    blueGreen: undefined;
  }

  export type OneOf = BlueGreenObject | CanaryObject;
}

type BaseSpec = Schemas.github$com$argoproj$argo_rollouts$pkg$apis$rollouts$v1alpha1$RolloutSpec;

export interface Spec extends Omit<BaseSpec, "strategy"> {
  minReadySeconds?: number;
  strategy: Strategy.OneOf;
  template: PodTemplate.Spec;
}

export interface Params {
  metadata: Metadata.Params;
  spec: Spec;
}

/**
 * argo rolloutがインストールされていることが前提
 * @param params
 * @returns
 */
export const create = (params: Params) => {
  return {
    apiVersion: "argoproj.io/v1alpha1",
    kind: "Rollout",
    metadata: params.metadata,
    spec: {
      ...params.spec,
      template: PodTemplate.create(params.spec.template),
    },
  };
};

export type Type = ReturnType<typeof create>;
