import * as Deployment from "./deployment";
import * as Endpoints from "./endpoints";
import * as EnvoyFilter from "./envoyfilter";
import * as HorizontalPodAutoscaler from "./horizontal-pod-autoscaler";
import * as Nginx from "./nginx";
import * as PodTemplate from "./pod-template";
import * as Rollout from "./rollout";
import * as Service from "./service";
import * as VirtualService from "./virtual-service";

export { Deployment, PodTemplate, Rollout, Service, VirtualService };

export class Template {
  public readonly rollout = new Rollout.Template();
  public readonly deployment = new Deployment.Template();
  public readonly service = new Service.Template();
  public readonly endpoints = new Endpoints.Template();
  public readonly virtualService = new VirtualService.Template();
  public readonly podTemplate = new PodTemplate.Template();
  public readonly horizontalPodAutoscaler = new HorizontalPodAutoscaler.Template();
  public readonly envoyfilter = new EnvoyFilter.Template();
  public readonly nginx = new Nginx.Template();
}
