import { Namespace } from "@source/definitions/meta";
import * as k8s from "@source/k8s";

import * as Formatter from "./formatter";
import * as NginxConfTemplate from "./nginx-conf-template";
import type * as Types from "./types";

export interface Params {
  name: string;
  nginxConf: Types.NginxConf;
}

export class Generator {
  public generate(params: Params): k8s.ConfigMap.Type {
    const labels: Record<string, string> = {
      app: params.name,
      version: "v1",
      "kubernetes.io/cluster-service": "true",
    };
    const nginxConf = Formatter.formatConf(NginxConfTemplate.createNginxConf(params.nginxConf));
    return k8s.ConfigMap.create({
      metadata: {
        name: params.name,
        namespace: Namespace,
        labels: labels,
        annotations: {
          /**
           * Applicationのpodの更新よりも前にConfigMapの更新を終えないといけないため、それ以前の値にする。
           */
          "argocd.argoproj.io/sync-wave": "-1",
        },
      },
      data: {
        "nginx.conf": nginxConf,
      },
    });
  }
}
