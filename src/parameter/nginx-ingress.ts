import type { EnvConfig, EnvName } from "@source/definitions/env";
import type { InputParams, Parameter } from "@source/types/parameter/nginx-ingress";

export class ParameterImpl implements Parameter {
  private config: EnvConfig<InputParams>;
  public readonly applicationName = "nginx-ingress";
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
      applicationName: "nginx-ingress",
    };
  }

  public getParameter(envName: EnvName): InputParams {
    return this.config[envName];
  }
}
