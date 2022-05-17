import * as Deployment from "./deployment";
import * as PodTemplate from "./pod-template";
import * as Service from "./service";

export { Deployment, PodTemplate, Service };

export class Template {
  public readonly deployment = new Deployment.Template();
  public readonly service = new Service.Template();
  public readonly podTemplate = new PodTemplate.Template();
}
