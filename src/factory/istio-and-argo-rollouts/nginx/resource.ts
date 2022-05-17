import * as Port from "@source/definitions/container-port";
import { IstioAndArgoRollouts } from "@source/templates";
import type * as Parameter from "@source/types/parameter/app";

export class Resource {
  private template = new IstioAndArgoRollouts.Template();
  constructor(private params: Parameter.InputParams) {}

  public get configMap() {
    if (!this.params.sidecarNginxConf) {
      return;
    }
    return this.template.nginx.configMap.generate({
      name: this.params.sidecarNginxConf.name,
      nginxConf: {
        port: Port.ClusterPort.Sidecar,
        ...this.params.sidecarNginxConf,
      },
    });
  }
}
