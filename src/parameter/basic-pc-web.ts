import type { EnvConfig, EnvName } from "@source/definitions/env";
import { GatewayName } from "@source/definitions/istio";
import { SlackChannelMap } from "@source/definitions/slack";
import type { InputParams, Parameter } from "@source/types/parameter/app";
import * as UserConfig from "@source/user-config";

export class ParameterImpl implements Parameter {
  private config: EnvConfig<InputParams>;
  public readonly applicationName = "basic-pc-web";
  private userConfig = UserConfig.getUserConfig(this.applicationName);
  constructor() {
    this.config = {
      dev: this.generate("dev"),
      stage: this.generate("stage"),
      qa: this.generate("qa"),
      production: this.generate("production"),
    };
  }

  private generate(envName: EnvName): InputParams {
    const userConfig = this.userConfig[envName];
    return {
      replicas: this.userConfig[envName].replicas,
      applicationName: this.applicationName,
      gatewayName: GatewayName.PcExampleCom,
      imageName: "ghcr.io/himenon/http-echo",
      applicationActiveVersion: userConfig.appVersion,
      httpMatchRequests: [
        {
          uri: {
            exact: "/",
          },
        },
      ],
      env: [
        {
          name: "PORT",
          value: "80",
        },
      ],
      notificationSlackChannel: SlackChannelMap[envName],
    };
  }

  public getParameter(envName: EnvName): InputParams {
    return this.config[envName];
  }
}
