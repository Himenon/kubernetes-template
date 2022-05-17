import { Namespace } from "@source/definitions/meta";
import * as k8s from "@source/k8s";

/**
 * Token bucketアルゴリズムの設定
 *
 * @see https://christina04.hatenablog.com/entry/rate-limiting-algorithm
 */
export interface TokenBucket {
  /**
   * bucketが持つ最大のtoken数
   **/
  max_tokens: number;
  /**
   * fill_intervalの間にbucketに追加するtoken数
   **/
  tokens_per_fill: number;
  /**
   * tokenを追加する頻度
   **/
  fill_interval: string;
}

export interface Params {
  applicationName: string;
  applicationVersion: string;
  tokenBucket: TokenBucket;
}

export class Generator {
  public generate(params: Params): k8s.EnvoyFilter.Type {
    return k8s.EnvoyFilter.create({
      metadata: {
        name: `filter-local-ratelimit-${params.applicationName}`,
        namespace: Namespace,
      },
      spec: {
        workloadSelector: {
          labels: {
            app: params.applicationName,
          },
        },
        configPatches: [this.generateHttpFilterConfigPatch(params)],
      },
    });
  }

  /**
   * Sidecarに到達するすべてのトラフィックを対象としたRatelimt
   * @returns
   */
  private generateHttpFilterConfigPatch(params: Params): k8s.EnvoyFilter.EnvoyConfigObjectPatch {
    return {
      applyTo: "HTTP_FILTER",
      match: {
        context: "SIDECAR_INBOUND",
        listener: {
          filterChain: {
            filter: {
              name: "envoy.filters.network.http_connection_manager",
            },
          },
        },
      },
      patch: {
        operation: "INSERT_BEFORE",
        value: {
          name: "envoy.filters.http.local_ratelimit",
          typed_config: {
            "@type": "type.googleapis.com/udpa.type.v1.TypedStruct",
            type_url: "type.googleapis.com/envoy.extensions.filters.http.local_ratelimit.v3.LocalRateLimit",
            value: {
              stat_prefix: "http_local_rate_limiter",
              token_bucket: params.tokenBucket,
              /**
               * 何%のリクエストをRatelimitの対象にするか。
               *   0% ... デフォルト
               * 100% ... すべて
               */
              filter_enabled: {
                runtime_key: "local_rate_limit_enabled",
                default_value: {
                  numerator: 100,
                  denominator: "HUNDRED",
                },
              },
              /**
               * `filter_enabled`で指定されたリクエスト（つまり通過してきたリクエスト）に対して、
               * どれくらいの割合にRatelimitを適用するか。
               *
               *   0% ... デフォルト
               * 100% ... すべてRatelimitの計算対象にする
               */
              filter_enforced: {
                runtime_key: "local_rate_limit_enforced",
                default_value: {
                  numerator: 100,
                  denominator: "HUNDRED",
                },
              },
              /**
               * Ratelimitの決定がされたレスポンスに対して付与するheader
               */
              response_headers_to_add: [
                {
                  append: false,
                  header: {
                    key: "x-local-rate-limit",
                    value: "true",
                  },
                },
              ],
            },
          },
        },
      },
    };
  }
}
