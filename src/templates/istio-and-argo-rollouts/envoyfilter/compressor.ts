import { Namespace } from "@source/definitions/meta";
import * as k8s from "@source/k8s";

export interface Params {
  applicationName: string;
}

export class Generator {
  public generate(params: Params): k8s.EnvoyFilter.Type {
    return k8s.EnvoyFilter.create({
      metadata: {
        name: `filter-compressor-${params.applicationName}`,
        namespace: Namespace,
      },
      spec: {
        workloadSelector: {
          labels: {
            app: params.applicationName,
          },
        },
        configPatches: [this.generateHttpFilterConfigPatch()],
      },
    });
  }

  /**
   * Sidecarに到達するすべてのトラフィックを対象としたRatelimt
   * @returns
   */
  private generateHttpFilterConfigPatch(): k8s.EnvoyFilter.EnvoyConfigObjectPatch {
    return {
      applyTo: "HTTP_FILTER",
      match: {
        /**
         * upstreamのrequestに対するフィルター扱いになる
         * （SIDECAR_OUTBOUNDはupstreamのserverが別のserverにアクセスするトラフィックに対して適用される）
         */
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
          name: "envoy.filters.http.compressor",
          typed_config: {
            "@type": "type.googleapis.com/envoy.extensions.filters.http.compressor.v3.Compressor",
            response_direction_config: {
              common_config: {
                min_content_length: 100,
                enabled: {
                  default_value: true,
                  runtime_key: "response_compressor_enabled",
                },
                content_type: ["text/html", "application/json", "text/css", "application/javascript"],
              },
              disable_on_etag_header: false,
            },
            request_direction_config: {
              common_config: {
                enabled: {
                  default_value: false,
                  runtime_key: "request_compressor_enabled",
                },
              },
            },
            compressor_library: {
              name: "text_optimized",
              typed_config: {
                "@type": "type.googleapis.com/envoy.extensions.compression.gzip.compressor.v3.Gzip",
                /**
                 * 1-9間。Memをたくさん使って高圧縮になる
                 */
                memory_level: 9,
                /**
                 * メモリ使用量を犠牲にして高圧縮になる
                 */
                window_bits: 10,
                /**
                 * BEST_COMPRESSION ... 遅いくせになんか圧縮率も悪い気がする
                 * BEST_SPEED       ... 最速でやる
                 */
                compression_level: "BEST_SPEED",
                /**
                 * @see https://www.envoyproxy.io/docs/envoy/latest/api-v3/extensions/compression/gzip/compressor/v3/gzip.proto#envoy-v3-api-field-extensions-compression-gzip-compressor-v3-gzip-compression-strategy
                 */
                compression_strategy: "DEFAULT_STRATEGY",
              },
            },
          },
        },
      },
    };
  }
}
