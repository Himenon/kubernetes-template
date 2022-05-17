/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
//
// This file allows NonNull Assersion.
// If any of the parameters required for reporting are broken, you can either fix this script, or you can use the
// correct the underlying data.
//
import { Namespace } from "@source/definitions/meta";
import type * as k8s from "@source/k8s";
import * as Normalizer from "@source/normalizer";
import type * as Factory from "@source/types/factory";
import * as fs from "fs";
import * as markdownTable from "markdown-table";
import * as path from "path";
import { format } from "prettier";

import * as TypeGuard from "../type-guard";
import { compareBasename } from "../utils";

export type ResourceRequreManifest = k8s.Deployment.Type | k8s.Rollout.Type | k8s.DaemonSet.Type;

export interface CalclatableResource {
  limits: {
    /** millcore */
    cpu: number;
    /** MB */
    memory: number;
  };
  requests: {
    /** millcore */
    cpu: number;
    /** MB */
    memory: number;
  };
}

export interface ContainerResource {
  name: string;
  resources: CalclatableResource;
}

export interface PodResource {
  name: string;
  kind: string;
  requestReplicas: number;
  nodeSelector: string;
  totalResource: CalclatableResource;
  containers: ContainerResource[];
}

const getManifests = (targets: Factory.Factory[]): any[] => {
  let list: Factory.Manifest[] = [];
  targets.forEach((target) => {
    const items = target.create();
    items.forEach((childItem) => {
      if (TypeGuard.isManifest(childItem)) {
        list.push(childItem.value as Factory.Manifest);
      } else if (TypeGuard.isDirectory(childItem)) {
        list = list.concat(getManifests([childItem.children]));
      }
    });
  });
  return list;
};

export class ReportWriter {
  constructor(private baseDir: string) {}

  private extractResourceIncludeManifests(targets: Factory.RootFactory[]): {
    resourceRequireManifests: ResourceRequreManifest[];
  } {
    const hasResourceManifestCheck = (value: any): value is ResourceRequreManifest => {
      return [TypeGuard.isDaemonsetManifest, TypeGuard.isDeploymentManifest, TypeGuard.isRolloutManifest].some((check) => check(value));
    };

    const manifests = getManifests(targets);
    const resourceRequireManifests = manifests.filter(hasResourceManifestCheck) as ResourceRequreManifest[];
    return {
      resourceRequireManifests,
    };
  }

  private getContainers(manifest: ResourceRequreManifest): k8s.PodTemplate.Container[] {
    const containers = manifest.spec?.template.spec?.containers;
    if (!containers || !Array.isArray(containers)) {
      throw new Error(`[${manifest.kind}/${manifest.metadata?.name}] ManifestにContainerが定義されていません`);
    }
    return containers;
  }

  private convertResourceStringToNumber(resource: k8s.PodTemplate.Resources): CalclatableResource {
    if (!resource.limits.cpu || !resource.requests.cpu || !resource.limits.memory || !resource.requests.memory) {
      throw new Error("Resourceが指定されていません");
    }
    return {
      limits: { cpu: Normalizer.normalizeCpuValue(resource.limits.cpu), memory: Normalizer.normalizeMemoryValue(resource.limits.memory) },
      requests: { cpu: Normalizer.normalizeCpuValue(resource.requests.cpu), memory: Normalizer.normalizeMemoryValue(resource.requests.memory) },
    };
  }

  private getReplicas(manifest: ResourceRequreManifest, nodeSelector: string) {
    if (TypeGuard.isDaemonsetManifest(manifest)) {
      if (nodeSelector === "gateway") {
        return 8;
      }
      if (nodeSelector === "worker") {
        return 32;
      }
      return NaN;
    }
    return manifest.spec?.replicas!;
  }

  private getNodeRole(manifest: ResourceRequreManifest): string {
    try {
      return manifest.spec?.template.spec?.nodeSelector!["my/node-role"]!;
    } catch (error) {
      return "UNDEFINED";
    }
  }

  private getIstioProxyContainerResource(annotations: Record<string, string>): ContainerResource {
    const resource: ContainerResource = {
      name: "istio-proxy",
      resources: {
        limits: {
          cpu: Normalizer.normalizeCpuValue(annotations["sidecar.istio.io/proxyCPULimit"] || "2"),
          memory: Normalizer.normalizeMemoryValue(annotations["sidecar.istio.io/proxyMemoryLimit"] || "1Gi"),
        },
        requests: {
          cpu: Normalizer.normalizeCpuValue(annotations["sidecar.istio.io/proxyCPU"] || "100m"),
          memory: Normalizer.normalizeMemoryValue(annotations["sidecar.istio.io/proxyMemory"] || "128Mi"),
        },
      },
    };
    return resource;
  }

  private getPodResource(manifest: ResourceRequreManifest): PodResource {
    const containers = this.getContainers(manifest);
    const nodeSelector = this.getNodeRole(manifest);
    const podResource: PodResource = {
      name: manifest.metadata?.name!,
      kind: manifest.kind!,
      requestReplicas: this.getReplicas(manifest, nodeSelector),
      nodeSelector: nodeSelector,
      totalResource: {
        limits: { cpu: 0, memory: 0 },
        requests: { cpu: 0, memory: 0 },
      },
      containers: [],
    };

    if (manifest.spec?.template.metadata?.annotations?.["sidecar.istio.io/inject"] !== "false") {
      const istioProxyResource = this.getIstioProxyContainerResource(manifest.metadata?.annotations || {});
      podResource.containers.push(istioProxyResource);
    }

    containers.forEach((container) => {
      const resources = container.resources as k8s.PodTemplate.Resources;
      const containerResouce: ContainerResource = {
        name: container.name,
        resources: this.convertResourceStringToNumber(resources),
      };
      podResource.containers.push(containerResouce);
    });

    podResource.containers.forEach((containerResouce) => {
      const { totalResource } = podResource;
      podResource.totalResource = {
        limits: {
          cpu: totalResource.limits.cpu + containerResouce.resources.limits.cpu,
          memory: totalResource.limits.memory + containerResouce.resources.limits.memory,
        },
        requests: {
          cpu: totalResource.requests.cpu + containerResouce.resources.requests.cpu,
          memory: totalResource.requests.memory + containerResouce.resources.requests.memory,
        },
      };
    });

    return podResource;
  }

  public async generateResourceReport(envName: string, targets: Factory.RootFactory[]): Promise<void> {
    const { resourceRequireManifests } = this.extractResourceIncludeManifests(targets);
    const podResources = resourceRequireManifests.map((manifest) => {
      return this.getPodResource(manifest);
    });

    const rows: string[][] = [[".metadata.name", ".kind", "CPU[mcore]", "MEM[MB]", "Replicas", "NodeSelector"]];
    const workerNodeTotalResource: CalclatableResource & { replicas: number } = {
      limits: { cpu: 0, memory: 0 },
      requests: { cpu: 0, memory: 0 },
      replicas: 0,
    };
    const gatewayNodeTotalResource: CalclatableResource & { replicas: number } = {
      limits: { cpu: 0, memory: 0 },
      requests: { cpu: 0, memory: 0 },
      replicas: 0,
    };
    const undefinedNodeTotalResource: CalclatableResource & { replicas: number } = {
      limits: { cpu: 0, memory: 0 },
      requests: { cpu: 0, memory: 0 },
      replicas: 0,
    };

    podResources
      .sort((a, b) => compareBasename(a.name, b.name))
      .forEach((podResource) => {
        const row: string[] = [
          podResource.name,
          podResource.kind,
          `${podResource.totalResource.requests.cpu}`,
          `${podResource.totalResource.requests.memory}`,
          `${podResource.requestReplicas}`,
          podResource.nodeSelector,
        ];
        const targetResource =
          podResource.nodeSelector === "worker"
            ? workerNodeTotalResource
            : podResource.nodeSelector === "gateway"
            ? gatewayNodeTotalResource
            : undefinedNodeTotalResource;
        targetResource.requests = {
          cpu: targetResource.requests.cpu + podResource.totalResource.requests.cpu * podResource.requestReplicas,
          memory: targetResource.requests.memory + podResource.totalResource.requests.memory * podResource.requestReplicas,
        };
        targetResource.limits = {
          cpu: targetResource.limits.cpu + podResource.totalResource.limits.cpu * podResource.requestReplicas,
          memory: targetResource.limits.memory + podResource.totalResource.limits.memory * podResource.requestReplicas,
        };
        targetResource.replicas += podResource.requestReplicas;
        rows.push(row);
      });

    const appResourceTableString = markdownTable(rows, {
      align: ["l", "l", "r", "r", "r"],
    });
    const gatewayNodeRow: string[] = [
      "Gateway",
      `${gatewayNodeTotalResource.requests.cpu / 1000}`,
      `${gatewayNodeTotalResource.requests.memory / 1000}`,
      `${gatewayNodeTotalResource.replicas}`,
    ];
    const workerNodeRow: string[] = [
      "Worker",
      `${workerNodeTotalResource.requests.cpu / 1000}`,
      `${workerNodeTotalResource.requests.memory / 1000}`,
      `${workerNodeTotalResource.replicas}`,
    ];

    const undefinedNodeRow: string[] = [
      "Undefined",
      `${undefinedNodeTotalResource.requests.cpu / 1000}`,
      `${undefinedNodeTotalResource.requests.memory / 1000}`,
      `${undefinedNodeTotalResource.replicas}`,
    ];
    const allResourceTableString = markdownTable(
      [["Node Role", "CPU[core]", "MEM[GB]", "Replicas"], gatewayNodeRow, workerNodeRow, undefinedNodeRow],
      {
        align: ["l", "r", "r", "r"],
      }
    );

    const mrkdown = [
      `# Resource Table`,
      `* Environment: ${envName}`,
      `* This report is an automatically generated file. Do not update it manually.`,
      `## Total Requests (namespace: ${Namespace})`,
      [
        "- Resource collected from PodTemplate multiplied by the number of Replica.",
        "- Also includes the value of istio-proxy, which is Sidecar Injection.",
      ].join("\n"),
      allResourceTableString,
      "## Request Resources",
      [
        "- Information collected from each PodTemplate is shown; Resource shows the value when Replica is 1.",
        "- Also includes the value of istio-proxy, which is Sidecar Injection.",
      ].join("\n"),
      appResourceTableString,
    ].join("\n\n");

    const filename = path.join(this.baseDir, `resource-table.md`);
    fs.mkdirSync(this.baseDir, { recursive: true });
    fs.writeFileSync(filename, format(mrkdown, { parser: "markdown" }), "utf-8");
    console.log(`Generate ${filename}`);
  }
}
