import { IstioIngressgateway } from "@source/templates";
import type { InputParams } from "@source/types/parameter/istio-ingressgateway";

export class Resource {
  private readonly generator = new IstioIngressgateway.Generator();

  constructor(private readonly params: InputParams) {}

  private get ingressGatewaySpec() {
    return this.generator.istioOperator.generateIstioIngressgateway({
      applicationName: this.params.applicationName,
      revision: "1-13-3",
      overlays: [],
      contentHash: "",
    });
  }

  public get istioOperator() {
    return this.generator.istioOperator.generate({
      name: "istio-ingressgateway",
      revision: "1-13-3",
      ingressGatewaySpec: this.ingressGatewaySpec,
    });
  }

  public get gatewayPc() {
    return this.generator.gateway.generate({
      name: "pc-example-com",
      hosts: ["pc.localhost.com"],
    });
  }

  public get gatewaySp() {
    return this.generator.gateway.generate({
      name: "sp-example-com",
      hosts: ["sp.localhost.com"],
    });
  }
}
