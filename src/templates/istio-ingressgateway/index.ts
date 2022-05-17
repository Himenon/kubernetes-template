import * as Gateway from "./gateway";
import * as IstioOperator from "./istio-operator";

export class Generator {
  public readonly istioOperator = new IstioOperator.Generator();
  public readonly gateway = new Gateway.Generator();
}
