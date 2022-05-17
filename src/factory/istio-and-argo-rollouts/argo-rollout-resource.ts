import type * as k8s from "@source/k8s";
import { IstioAndArgoRollouts } from "@source/templates";
import type * as Parameter from "@source/types/parameter/app";

import { createContentHash } from "../utils";
import * as Nginx from "./nginx/resource";

export class Resource {
  private template = new IstioAndArgoRollouts.Template();
  private defaultReplicas = 2;
  public readonly nginx: Nginx.Resource;
  constructor(private params: Parameter.InputParams) {
    this.nginx = new Nginx.Resource(params);
  }

  public get primaryService() {
    return this.template.service.generateClusterIpService({
      name: `${this.params.applicationName}-primary`,
      applicationName: this.params.applicationName,
      sidecarName: this.params.sidecarNginxConf?.name,
    });
  }

  public get secondaryService() {
    return this.template.service.generateClusterIpService({
      name: `${this.params.applicationName}-secondary`,
      applicationName: this.params.applicationName,
      sidecarName: this.params.sidecarNginxConf?.name,
    });
  }

  private get sidecarParams(): IstioAndArgoRollouts.PodTemplate.SidecarParams | undefined {
    if (!this.params.sidecarNginxConf) {
      return undefined;
    }
    const applicationName = this.params.sidecarNginxConf.name;
    return {
      applicationName: applicationName,
      volumeMounts: {
        [applicationName]: [
          {
            name: this.params.sidecarNginxConf.name,
            mountPath: "/etc/nginx",
          },
        ],
      },
    };
  }

  private get volumes(): k8s.PodTemplate.Volume[] | undefined {
    const defaultVolumes = this.params.volumes;
    if (!this.params.sidecarNginxConf) {
      return defaultVolumes;
    }
    return [
      ...(defaultVolumes || []),
      {
        name: this.params.sidecarNginxConf.name,
        configMap: {
          name: this.params.sidecarNginxConf.name,
          items: [
            {
              key: "nginx.conf",
              path: "nginx.conf",
            },
          ],
        },
      },
    ];
  }

  private get configmapContentHash(): string | undefined {
    if (!this.nginx.configMap) {
      return;
    }
    const inputText = JSON.stringify({
      configMapErrorPage: this.nginx.configMap,
    });
    return createContentHash(inputText);
  }

  private get podTemplate() {
    return this.template.podTemplate.generate({
      applicationVersion: this.params.applicationActiveVersion,
      applicationName: this.params.applicationName,
      imageName: this.params.imageName,
      resources: this.params.resources,
      env: {
        [this.params.applicationName]: this.params.env,
      },
      envFrom: {
        [this.params.applicationName]: this.params.envFrom || [],
      },
      nodeKind: this.params.nodeKind,
      probe: this.params.probeThreshold,
      volumes: this.volumes,
      volumeMounts: {
        [this.params.applicationName]: this.params.volumeMounts || [],
      },
      sidecar: this.sidecarParams,
      contenthash: this.configmapContentHash,
    });
  }

  public get rollout() {
    return this.template.rollout.generate({
      applicationName: this.params.applicationName,
      podTemplate: this.podTemplate,
      replicas: this.params.replicas || this.defaultReplicas,
      notificationSlackChannel: this.params.notificationSlackChannel,
    });
  }

  private get httpRouteForRollouts() {
    return this.template.virtualService.httpRoute.generateUsingRolloutHttpRoutes({
      applicationName: this.params.applicationName,
      httpMatchRequests: this.params.httpMatchRequests,
      useSidecar: !!this.params.sidecarNginxConf,
    });
  }

  public get virtualService() {
    return this.template.virtualService.generate({
      applicationName: this.params.applicationName,
      gatewayName: this.params.gatewayName,
      http: this.httpRouteForRollouts,
    });
  }

  private generateHpa(kind: string, apiVersion: string) {
    if (!this.params.hpa) {
      return;
    }
    return this.template.horizontalPodAutoscaler.generate({
      name: this.params.applicationName,
      spec: {
        minReplicas: this.params.hpa.minReplicas || this.params.replicas,
        /**
         * ArgoRollouts does not work correctly when maxSurge of ArgoRollouts is less than the number of replicas when it occurs
         */
        maxReplicas: this.params.hpa.maxReplicas,
        scaleTargetRef: {
          kind: kind,
          apiVersion: apiVersion,
          name: this.params.applicationName,
        },
        metrics: [
          {
            type: "Resource",
            resource: {
              name: "cpu",
              target: {
                type: "Utilization",
                averageUtilization: this.params.hpa.triggerCPUUsage || 80,
              },
            },
          },
        ],
      },
    });
  }

  public get hpa() {
    return this.generateHpa("Rollout", "argoproj.io/v1alpha1");
  }
}
