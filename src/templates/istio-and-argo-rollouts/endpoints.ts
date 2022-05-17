import { Namespace } from "@source/definitions/meta";
import * as k8s from "@source/k8s";

export interface Params {
  name: string;
  subset: k8s.Endpoints.Subset;
}

export class Template {
  public generate(params: Params): k8s.Endpoints.Type {
    return k8s.Endpoints.create({
      metadata: {
        name: params.name,
        namespace: Namespace,
      },
      subsets: [params.subset],
    });
  }
}
