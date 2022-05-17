import { applicationPartOf, Namespace } from "@source/definitions/meta";
import * as k8s from "@source/k8s";

export interface Params {
  applicationName: string;
  replicas: number;
  podTemplate: k8s.PodTemplate.Spec;
  notificationSlackChannel: string;
}

export class Template {
  private maxSurgePercent = 25;
  private createPauseStep(durationSec?: number): k8s.Rollout.Strategy.Step {
    if (!durationSec) {
      return {
        pause: {},
      };
    }
    return {
      pause: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        duration: durationSec as any,
      },
    };
  }
  private createCanaryScale(replicas: number): k8s.Rollout.Strategy.Step {
    return {
      setCanaryScale: {
        replicas: Math.ceil(replicas),
        /**
         * MatchTrafficWeightは、以前に設定された ReplicasやWeightをキャンセルし、SetWeightを有効にする。
         *
         * trueの場合の挙動
         *
         * 1. canary.go#UseSetCanaryScaleが必ずnilを返すようになる
         * @see https://github.com/argoproj/argo-rollouts/blob/v1.2.0/utils/replicaset/canary.go#L499
         * 2. canary.go#GetCanaryReplicasOrWeightがstep実行中は必ず nil, GetCurrentSetWeight(rollout) を返すようになる
         * @see https://github.com/argoproj/argo-rollouts/blob/v1.2.0/utils/replicaset/canary.go#L449
         * 3. canary.go#CalculateReplicaCountsForTrafficRoutedCanaryでcanaryに充てがわれるreplica数はTraffic Weightに比例したreplica数になる
         * @see https://github.com/argoproj/argo-rollouts/blob/v1.2.0/utils/replicaset/canary.go#L322
         */
        matchTrafficWeight: true,
      },
    };
  }
  private createCanaryStrategy(params: Params): k8s.Rollout.Strategy.Canary {
    const steps: (k8s.Rollout.Strategy.Step | undefined)[] = [
      this.createCanaryScale(params.replicas * ((3 * this.maxSurgePercent) / 100)),
      this.createPauseStep(10),
      {
        setWeight: 100 - this.maxSurgePercent * 3,
      },
      this.createCanaryScale(params.replicas * (this.maxSurgePercent / 100)),
      this.createPauseStep(10),
      {
        setWeight: 100 - this.maxSurgePercent * 2,
      },
      this.createCanaryScale(params.replicas * ((2 * this.maxSurgePercent) / 100)),
      this.createPauseStep(10),
      {
        setWeight: 100 - this.maxSurgePercent,
      },
      this.createCanaryScale(params.replicas),
      this.createPauseStep(10),
      {
        setWeight: 100,
      },
    ];
    return {
      trafficRouting: {
        istio: {
          virtualService: {
            name: params.applicationName,
            routes: [`http-${params.applicationName}-primary`],
          },
        },
      },
      // maxUnavailable: Math.ceil(params.replicas * this.maxSurgePercent / 100),
      maxSurge: `${this.maxSurgePercent}%`,
      stableService: `${params.applicationName}-primary`,
      canaryService: `${params.applicationName}-secondary`, // こことVirtualServiceのnameが一致する
      /**
       * trueの場合
       * DynamicStableScaleは、stableを動的にスケーリングするトラフィックルーティング機能です。
       * ReplicaSet を動的にスケールして、更新中に動作しているポッドの合計を最小にするトラフィックルーティング機能です。
       * これは、canaryへのトラフィックが増加するにつれて、stable をスケールダウンさせます。
       *
       * falseの場合
       * 無効 (デフォルトの動作 ) にすると、安定版 ReplicaSet は完全にスケールされたままとなり、瞬時のアボートをサポートします。
       *
       * 詳細な計算方法は以下の実装をみるとよい（雰囲気で読めます）
       * @see https://github.com/argoproj/argo-rollouts/blob/v1.2.0/utils/replicaset/canary.go#L311-L354
       */
      dynamicStableScale: true,
      steps: steps.filter((step): step is k8s.Rollout.Strategy.Step => !!step),
    };
  }
  public generate(params: Params): k8s.Rollout.Type {
    return k8s.Rollout.create({
      metadata: {
        name: params.applicationName,
        namespace: Namespace,
        labels: {
          app: params.applicationName,
          "app.kubernetes.io/name": params.applicationName,
          "app.kubernetes.io/part-of": applicationPartOf,
        },
        annotations: {
          "notifications.argoproj.io/subscribe.on-rollout-completed.slack": params.notificationSlackChannel,
          "notifications.argoproj.io/subscribe.on-rollout-step-completed.slack": params.notificationSlackChannel,
          "notifications.argoproj.io/subscribe.on-rollout-updated.slack": params.notificationSlackChannel,
          "notifications.argoproj.io/subscribe.on-scaling-replica-set.slack": params.notificationSlackChannel,
        },
      },
      spec: {
        replicas: params.replicas,
        revisionHistoryLimit: 2,
        minReadySeconds: 10,
        selector: {
          matchLabels: {
            "app.kubernetes.io/name": params.applicationName,
            "app.kubernetes.io/part-of": applicationPartOf,
          },
        },
        template: params.podTemplate,
        strategy: {
          canary: this.createCanaryStrategy(params),
          blueGreen: undefined,
        },
      },
    });
  }
}
