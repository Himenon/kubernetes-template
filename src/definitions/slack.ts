import { EnvConfig } from "@source/definitions/env";

export const SlackChannelMap: EnvConfig<string> = {
  dev: "k8s-dev",
  qa: "k8s-qa",
  stage: "k8s-stage",
  production: "k8s-production",
};
