import type { Schemas } from "@himenon/kubernetes-typescript-openapi/v1.18.20";

import * as Metadata from "./base/metadata";
import * as PodTemplate from "./pod-template";

export interface Params {
  metadata: Metadata.Params;
  spec: Schemas.io$k8s$api$batch$v1beta1$CronJobSpec & {
    // stringより厳密に値域を設定したいので部分的に上書き
    concurrencyPolicy: "Allow" | "Replace" | "Forbid",
    jobTemplate: {
      spec: {
        template: {
          // metadataはspecの子ではなく兄弟として存在しないといけない
          metadata: Schemas.io$k8s$apimachinery$pkg$apis$meta$v1$ObjectMeta;
          spec: Omit<PodTemplate.Spec, "metadata">;
        }
      }
    }
  };
}

export type Type = Schemas.io$k8s$api$batch$v1beta1$CronJob;

export const create = (params: Params): Type => {
  return {
    apiVersion: "batch/v1",
    kind: "CronJob",
    metadata: params.metadata,
    spec: params.spec,
  };
};
