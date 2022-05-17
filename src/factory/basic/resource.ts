import { Basic } from "@source/templates";
import type * as Parameter from "@source/types/parameter/app";

export class Resource {
  private template = new Basic.Template();
  constructor(private params: Parameter.InputParams) {}

  public get service() {
    return this.template.service.generateClusterIpService({
      name: `${this.params.applicationName}`,
      applicationName: this.params.applicationName,
    });
  }

  public get deployment() {
    return this.template.deployment.generate({
      applicationName: this.params.applicationName,
      podTemplate: this.podTemplate,
      replicas: this.params.replicas || 3,
    });
  }

  private get podTemplate() {
    return this.template.podTemplate.generate({
      applicationVersion: this.params.applicationActiveVersion,
      applicationName: this.params.applicationName,
      imageName: this.params.imageName,
      resources: {
        limits: {
          cpu: "150m",
          memory: "150Mi",
        },
        requests: {
          cpu: "100m",
          memory: "100Mi",
        },
      },
      env: {
        [this.params.applicationName]: this.params.env,
      },
      envFrom: {
        [this.params.applicationName]: this.params.envFrom || [],
      },
      nodeKind: this.params.nodeKind,
      volumes: this.params.volumes,
      volumeMounts: {
        [this.params.applicationName]: this.params.volumeMounts || [],
      },
      contenthash: undefined,
    });
  }
}
