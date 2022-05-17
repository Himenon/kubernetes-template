import { IstioAndArgoRollouts } from "@source/templates";
import type * as Parameter from "@source/types/parameter/app";

import * as Nginx from "./nginx/resource";

export class Resource {
  private template = new IstioAndArgoRollouts.Template();
  public readonly nginx: Nginx.Resource;
  constructor(private params: Parameter.InputParams) {
    this.nginx = new Nginx.Resource(params);
  }

  public get clusterIpService() {
    return this.template.service.generateClusterIpService({
      name: this.params.applicationName,
      applicationName: this.params.applicationName,
      sidecarName: this.params.sidecarNginxConf?.name,
    });
  }

  public get compressor() {
    return this.template.envoyfilter.compressor.generate({
      applicationName: this.params.applicationName,
    });
  }

  public get localRatelimit() {
    const tokenBucket = this.params?.localRatelimit?.tokenBucket;
    if (!tokenBucket) {
      return;
    }
    return this.template.envoyfilter.localRatelimit.generate({
      applicationName: this.params.applicationName,
      applicationVersion: this.params.applicationActiveVersion,
      tokenBucket: tokenBucket,
    });
  }
}
