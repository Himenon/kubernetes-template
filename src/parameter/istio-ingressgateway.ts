import type { EnvConfig, EnvName } from "@source/definitions/env";
import type { InputParams, Parameter } from "@source/types/parameter/istio-ingressgateway";

export class ParameterImpl implements Parameter {
  private config: EnvConfig<InputParams>;
  public readonly applicationName = "istio-ingressgateway";
  constructor() {
    this.config = {
      dev: this.generate("dev"),
      stage: this.generate("stage"),
      qa: this.generate("qa"),
      production: this.generate("production"),
    };
  }

  private generate(_envName: EnvName): InputParams {
    return {
      applicationName: "istio-ingressgateway",
    };
  }

  public getParameter(envName: EnvName): InputParams {
    return this.config[envName];
  }
}
