import * as Metadata from "./base/metadata";

/**
 * @see https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-ApplyTo
 */
export type ApplyTo =
  | "INVALID"
  | "LISTENER"
  | "FILTER_CHAIN"
  | "NETWORK_FILTER"
  | "HTTP_FILTER"
  | "ROUTE_CONFIGURATION"
  | "VIRTUAL_HOST"
  | "HTTP_ROUTE"
  | "CLUSTER"
  | "EXTENSION_CONFIG"
  | "BOOTSTRAP";

/**
 * @see https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-PatchContext
 */
export type PatchContext = "ANY" | "SIDECAR_INBOUND" | "SIDECAR_OUTBOUND" | "GATEWAY";

/**
 * @see https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-ListenerMatch-SubFilterMatch
 */
export interface SubFilterMatch {
  name?: string;
}

/**
 * @see https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-ListenerMatch-FilterMatch
 */
export interface FilterMatch {
  /**
   * 以下のCanonical Namesを利用すること
   * @see https://www.envoyproxy.io/docs/envoy/latest/version_history/v1.14.0#deprecated
   */
  name?: string;
  subFilter?: SubFilterMatch;
}

/**
 * @see https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-ListenerMatch-FilterChainMatch
 */
export interface FilterChainMatch {
  name?: string;
  filter?: FilterMatch;
}

/**
 * @see https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-ListenerMatch
 */
export interface ListenerMatch {
  portNumber?: number;
  filterChain?: FilterChainMatch;
  name?: string;
}

/**
 * @see https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-RouteConfigurationMatch-RouteMatch-Action
 */
export type RouteMatchAction = "ANY" | "ROUTE" | "REDIRECT" | "DIRECT_RESPONSE";

/**
 * @see https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-RouteConfigurationMatch-RouteMatch
 */
export interface RouteConfigurationMatchRouteMatch {
  /**
   * デフォルトで生成されたRouteオブジェクトには、デフォルトの名前が付けられています。
   * 仮想サービスを使用して生成されたルートオブジェクトには、仮想サービスのHTTPルートで使用されている名前が付けられます。
   */
  name?: string;
  /**
   * ルートを特定のアクションタイプと一致させます。
   */
  action?: RouteMatchAction;
}

/**
 * @see https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-RouteConfigurationMatch-VirtualHostMatch
 */
export interface VirtualHostMatch {
  /**
   * Istioによって生成されたVirtualHostsオブジェクトは、host:portという名前が付けられます。
   * ここで、ホストは通常、VirtualServiceのホストフィールドまたはレジストリ内のサービスのホスト名に対応します。
   */
  name?: string;
  /**
   * 仮想ホスト内の特定のルートに一致します。
   */
  route?: RouteConfigurationMatchRouteMatch;
}

/**
 * @see https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-RouteConfigurationMatch
 */
export interface RouteConfigurationMatch {
  /**
   * このルート構成が生成されたサービスポート番号またはゲートウェイサーバーのポート番号。省略した場合、すべてのポートのルート構成に適用されます。
   */
  portNumber?: number;
  /**
   * GATEWAYコンテキストにのみ適用されます。このルート構成が生成されたゲートウェイサーバーのポート名。
   */
  portName?: string;
  /**
   * このルート構成が生成されたIstioゲートウェイ構成の名前空間/名前。コンテキストがGATEWAYの場合にのみ適用されます。名前空間/名前の形式である必要があります。
   * このフィールドをportNumberおよびportNameと組み合わせて使用すると、ゲートウェイ構成オブジェクト内の特定のHTTPSサーバーのエンボイルート構成を正確に選択できます。
   */
  gateway?: string;
  /**
   * ルート構成内の特定の仮想ホストを照合し、パッチを仮想ホストに適用します。
   */
  vhost?: VirtualHostMatch;
  /**
   * 一致するルート構成名。http_proxyすべてのサイドカー用に内部で生成されたルート構成など、特定のルート構成を名前で照合するために使用できます。
   */
  name?: string;
}

/**
 * @see https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-ClusterMatch
 */
export interface ClusterMatch {
  /**
   * このクラスターが生成されたサービスポートです。
   * 省略された場合は、任意のポートに対するクラスターに適用されます。注：インバウンドクラスターの場合は、サービスターゲットポートとなります。
   */
  portNumber?: number;
  /**
   * このクラスターの完全修飾サービス名です。省略した場合は、すべてのサービスのクラスターに適用されます。
   * サービスエントリで定義されたサービスの場合、サービス名はサービスエントリで定義されたホストと同じになります。
   * 注：インバウンドクラスターの場合、これは無視されます。
   */
  service?: string;
  /**
   * サービスに関連するサブセット。
   * 省略された場合、サービスの任意のサブセットのクラスターに適用されます。
   */
  subset?: string;
  /**
   * 一致するクラスターの正確な名前。
   * 内部で生成されたPassthroughクラスターなど、特定のクラスターに名前でマッチさせるには、
   * clusterMatchの名前以外のすべてのフィールドを空にします。
   */
  name?: string;
}

/**
 * @see https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-EnvoyConfigObjectMatch
 */
export interface EnvoyConfigObjectMatch {
  context?: PatchContext;
  listener?: ListenerMatch;
  routeConfiguration?: RouteConfigurationMatch;
  cluster?: ClusterMatch;
}

/**
 * @see https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-Patch-Operation
 */
export type Operation = "INVALID" | "MERGE" | "ADD" | "REMOVE" | "INSERT_BEFORE" | "INSERT_AFTER" | "INSERT_FIRST" | "REPLACE";

export type FilterClass = "UNSPECIFIED" | "AUTHN" | "AUTHZ" | "STATS";

/**
 * @see https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-Patch
 */
export interface Patch {
  operation: Operation;
  value: unknown;
  filterClass?: FilterClass;
}

/**
 * @see https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-EnvoyConfigObjectPatch
 */
export interface EnvoyConfigObjectPatch {
  applyTo: ApplyTo;
  match?: EnvoyConfigObjectMatch;
  patch?: Patch;
}

export interface Spec {
  workloadSelector?: {
    labels?: Record<string, string>;
  };
  configPatches: EnvoyConfigObjectPatch[];
}

export interface Params {
  metadata: Metadata.Params;
  spec: Spec;
}

export const create = (params: Params) => {
  return {
    apiVersion: "networking.istio.io/v1alpha3",
    kind: "EnvoyFilter",
    metadata: params.metadata,
    spec: params.spec,
  };
};

export type Type = ReturnType<typeof create>;
