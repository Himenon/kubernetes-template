import * as ConfigMap from "./configmap";

export class Template {
  public readonly configMap = new ConfigMap.Generator();
}
