import type * as Base from "@source/types/factory";

import { formatItems } from "../../utils";
import type { Resource } from "./resource";

export class Factory implements Base.Factory {
  constructor(private readonly resource: Resource) {}

  public create(): Base.Item[] {
    return formatItems([
      {
        name: "config-map",
        value: this.resource.configMap,
      },
    ]);
  }
}
