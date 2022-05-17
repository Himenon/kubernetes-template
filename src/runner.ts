import type { EnvName } from "@source/definitions/env";
import * as Factories from "@source/factory";
import { Mixin } from "@source/mixin";
import * as Parameters from "@source/parameter";
import type { RootFactory } from "@source/types/factory";

export class Run {
  private mixin: Mixin;

  constructor(private env: EnvName, outputDir: string) {
    const targets: RootFactory[] = [
      new Factories.Basic.Factory(this.env, new Parameters.BasicSpWeb.ParameterImpl()),
      new Factories.Basic.Factory(this.env, new Parameters.BasicPcWeb.ParameterImpl()),
      /**
       * @see https://kubernetes.github.io/ingress-nginx/deploy/
       */
      // new Factories.NginxIngress.Factory(this.env, new Parameters.NginxIngress.ParameterImpl()),
      /**
       * If istio and Argo Rollouts are available for setup, they are available.
       *
       * @see https://istio.io/latest/docs/setup/getting-started/
       * @see https://argoproj.github.io/argo-rollouts/
       */
      new Factories.IstioIngressgateway.Factory(this.env, new Parameters.IstioIngressgateway.ParameterImpl()),
      new Factories.IstioAndArgoRollouts.Factory(this.env, new Parameters.SpWeb.ParameterImpl()),
      new Factories.IstioAndArgoRollouts.Factory(this.env, new Parameters.PcWeb.ParameterImpl()),
    ];
    this.mixin = new Mixin(outputDir, targets);
  }

  public async start(): Promise<void> {
    this.mixin.cleanup();
    const tasks = [this.mixin.createRootKustomization([]), ...this.mixin.createManifestTasks()];
    await Promise.all(tasks);
  }

  public async createReport(): Promise<void> {
    await this.mixin.generateResourceReport(this.env);
  }
}
