import * as Port from "@source/definitions/container-port";
import { applicationPartOf, DefaultImagePullSecret } from "@source/definitions/meta";
import type * as k8s from "@source/k8s";
import { normalizeCpuValue, normalizeMemoryValue } from "@source/normalizer";

export interface Params {
  applicationVersion: string;
  applicationName: string;
  imageName: string;
  resources?: k8s.PodTemplate.Resources;
  env: Record<string, k8s.PodTemplate.Env[]>;
  envFrom?: Record<string, k8s.PodTemplate.EnvFrom[]>;
  nodeKind?: k8s.PodTemplate.NodeKind;
  volumes?: k8s.PodTemplate.Volume[];
  volumeMounts: Record<string, k8s.PodTemplate.VolumeMount[]>;
  probe?: {
    failureThreshold: number;
    timeoutSeconds: number;
    initialDelaySeconds?: number;
  };
  contenthash: string | undefined;
}

export class Template {
  private defatulMinimumResource = {
    limits: {
      cpu: "1",
      memory: "1Gi",
    },
    requests: {
      cpu: "0.1",
      memory: "100Mi",
    },
  } as const;

  private generateResources(params: Params): k8s.PodTemplate.Resources {
    const resources: k8s.PodTemplate.Resources = {
      limits: {
        ...this.defatulMinimumResource.limits,
        ...params.resources?.limits,
      },
      requests: {
        ...this.defatulMinimumResource.requests,
        ...params.resources?.requests,
      },
    };
    const errorMessages: string[] = [];
    if (resources.requests.cpu && normalizeCpuValue(resources.requests.cpu) < normalizeCpuValue(this.defatulMinimumResource.requests.cpu)) {
      const value = normalizeCpuValue(this.defatulMinimumResource.requests.cpu);
      errorMessages.push(`CPU Requests should be more than ${value}mcore. It may cause the system to stop booting.`);
    }
    if (
      resources.requests.memory &&
      normalizeMemoryValue(resources.requests.memory) < normalizeMemoryValue(this.defatulMinimumResource.requests.memory)
    ) {
      const value = normalizeMemoryValue(this.defatulMinimumResource.requests.memory);
      errorMessages.push(`Memory Requests should be more than ${value}MB. It may cause the system to stop booting.`);
    }
    if (resources.limits.cpu && resources.requests.cpu && normalizeCpuValue(resources.limits.cpu) < normalizeCpuValue(resources.requests.cpu)) {
      errorMessages.push(`CPU Requests is specified more than Limit.`);
    }
    if (
      resources.limits.memory &&
      resources.requests.memory &&
      normalizeMemoryValue(resources.limits.memory) < normalizeMemoryValue(resources.requests.memory)
    ) {
      errorMessages.push(`Memory Requests is specified more than Limit.`);
    }
    if (errorMessages.length > 0) {
      const message = [`Invalid Resource Parameters: ${params.applicationName}`, errorMessages.map((m) => `- ${m}`).join("\n")].join("\n");
      throw new Error(message);
    }
    return resources;
  }

  private generateAnnotations(params: Params): Record<string, string> | undefined {
    const annotations: Record<string, string> = {};
    if (params.contenthash) {
      annotations["dependency.config-map.content-hash"] = params.contenthash;
    }
    return {
      ...annotations,
    };
  }

  private createAppContainer(params: Params): k8s.PodTemplate.Container {
    return {
      name: params.applicationName,
      env: params.env[params.applicationName] || [],
      envFrom: params.envFrom && params.envFrom[params.applicationName].length !== 0 ? params.envFrom[params.applicationName] : undefined,
      image: `${params.imageName}:${params.applicationVersion}`,
      ports: [
        {
          containerPort: Port.ClusterPort.App,
        },
      ],
      livenessProbe: {
        failureThreshold: 3,
        timeoutSeconds: 3,
        initialDelaySeconds: 15,
        httpGet: {
          path: "/status",
          port: Port.ClusterPort.App,
        },
        ...params.probe,
      },
      readinessProbe: {
        failureThreshold: 3,
        timeoutSeconds: 3,
        initialDelaySeconds: 15,
        httpGet: {
          path: "/status",
          port: Port.ClusterPort.App,
        },
        ...params.probe,
      },
      resources: this.generateResources(params),
      volumeMounts:
        params.volumeMounts[params.applicationName] && params.volumeMounts[params.applicationName].length > 0
          ? params.volumeMounts[params.applicationName]
          : undefined,
    };
  }

  private createContainers(params: Params): k8s.PodTemplate.Container[] {
    return [this.createAppContainer(params)];
  }

  /**
   * Calculate the Weight obtained from the Selector to be matched for each Node and determine the priority of placement.
   *
   *  Note that "place/not place" depends on the specification of the parent using WeightedPodAffinityTerm.
   * - In the case of podAffinity, "place in the Node with the highest score".
   * - For podAntiAffinity, "do not place on the node with the highest score".
   */
  private generagteWeightedPodAffinityTerm(params: Params): k8s.PodTemplate.WeightedPodAffinityTerm {
    return {
      /**
       * Priority weighting (defined between 1 - 100)
       * Add the weights for each Node and calculate the Score, and pods are placed on the Node with the highest score.
       */
      weight: 1,
      /**
       * app.kubernetes.io/name = params.applicationName のラベルを持つPod
       */
      podAffinityTerm: {
        /**
         * @see https://kubernetes.io/docs/reference/labels-annotations-taints/#kubernetesiohostname
         *
         * Key for filtering Nodes.
         * `kubernetes.io/hostname` can be used as a generic identifier given to each Node (unbiased key as a filtering condition for Nodes)
         */
        topologyKey: "kubernetes.io/hostname",
        labelSelector: {
          /**
           * Pods matching app.kubernetes.io/name = params.applicationName to be aggregated
           */
          matchExpressions: [
            {
              key: "app.kubernetes.io/name",
              operator: "In",
              values: [params.applicationName],
            },
          ],
        },
      },
    };
  }

  public generate(params: Params): k8s.PodTemplate.Spec {
    return {
      metadata: {
        labels: {
          app: params.applicationName,
          version: params.applicationVersion,
          /**
           * Must be changed at the same time as podAffinity in order to be used with podAffinity.
           */
          "app.kubernetes.io/name": params.applicationName,
          "app.kubernetes.io/part-of": applicationPartOf,
          "app.kubernetes.io/version": params.applicationVersion,
        },
        annotations: this.generateAnnotations(params),
      },
      containers: this.createContainers(params),
      volumes: params.volumes,
      imagePullSecrets: [
        {
          name: DefaultImagePullSecret,
        },
      ],
      affinity: {
        /**
         * Scheduling rules between pods
         * Policies that do not place in locations that meet the following conditions
         */
        podAntiAffinity: {
          /**
           * Priority scheduling policies to be considered
           */
          preferredDuringSchedulingIgnoredDuringExecution: [this.generagteWeightedPodAffinityTerm(params)],
        },
      },
    };
  }
}
