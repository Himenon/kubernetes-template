import { applicationPartOf, Namespace } from "@source/definitions/meta";
import * as k8s from "@source/k8s";

export interface Params {
  applicationName: string;
  replicas: number;
  podTemplate: k8s.PodTemplate.Spec;
}

export class Template {
  public generate(params: Params): k8s.Deployment.Type {
    return k8s.Deployment.create({
      metadata: {
        name: params.applicationName,
        namespace: Namespace,
        labels: {
          app: params.applicationName,
          "app.kubernetes.io/name": params.applicationName,
          "app.kubernetes.io/part-of": applicationPartOf,
        },
        annotations: {},
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
        strategy: {
          type: "RollingUpdate",
          rollingUpdate: {
            /**
             * 理想状態のPod数を超えて作成できる最大のPod数を指定
             * => すなわち、Rolling Update開始直後 25%は次のバージョンのPodが追加で起動する
             */
            maxSurge: Math.ceil(params.replicas * 0.25), // 125%まで許容するものとする
            /**
             * 更新処理において利用不可となる最大のPod数を指定
             * 0の場合、STATUS: Runnningかつ、ReadyがMAXになってからトラフィックが流れるようになる
             */
            maxUnavailable: 0,
          },
        },
        template: params.podTemplate,
      },
    });
  }
}
