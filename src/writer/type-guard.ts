import type * as k8s from "@source/k8s";
import type * as Factory from "@source/types/factory";
import * as query from "json-query";

export const isManifest = (item: Factory.Item): item is Factory.Manifest => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(item as any).value;
};

export const isDirectory = (item: Factory.Item): item is Factory.Directory => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(item as any).children;
};

export const isDeploymentManifest = (manifest: unknown): manifest is k8s.Deployment.Type => {
  const value = query("kind", { data: manifest }).value;
  return value === "Deployment";
};

export const isRolloutManifest = (manifest: unknown): manifest is k8s.Rollout.Type => {
  const value = query("kind", { data: manifest }).value;
  return value === "Rollout";
};

export const isDaemonsetManifest = (manifest: unknown): manifest is k8s.DaemonSet.Type => {
  const value = query("kind", { data: manifest }).value;
  return value === "DaemonSet";
};

export const isIstioOperator = (name: string, manifest: unknown): manifest is k8s.IstioOperator.Type => {
  const value = query("kind", { data: manifest }).value;
  const metadataName = query("metadata.name", { data: manifest }).value;
  return value === "IstioOperator" && metadataName === name;
};
