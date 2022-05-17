import { NginxIngress } from "@source/templates";
import type * as Parameter from "@source/types/parameter/nginx-ingress";

export class Resource {
  private template = new NginxIngress.Template();
  constructor(private params: Parameter.InputParams) {}

  public get ingress() {
    return this.template.ingress.generate({
      name: this.params.applicationName,
    });
  }
}
