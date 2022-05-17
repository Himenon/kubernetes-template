import * as Ingress from "./ingress";
import * as Service from "./service";

export { Ingress, Service };

export class Template {
  public readonly ingress = new Ingress.Template();
  public readonly service = new Service.Template();
}
