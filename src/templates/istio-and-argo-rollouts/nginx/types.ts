/** リクエストのスループット制限 */
export interface LimitRequestZone {
  /** ゾーン名 */
  name: string;
  /**
   * ゾーンのサイズ（容量）2MB
   * @example 2m
   */
  size: string;
  /** 接続制限する際に、接続を同一とみなすキー */
  key?: string;
  /**
   * rps
   */
  rate: string;
}

/** ZoneにBurst耐性をもたせる */
export interface LimitRequest {
  /** 利用するゾーン名 */
  zoneName: string;
  /** 最大受付可能なリクエストの個数 */
  burst: number;
  /** delayしないリクエストの個数 */
  delay: number;
}

export interface Location {
  path: string;
  limitReq?: LimitRequest;
  /** 未確定のオプションなど */
  others?: Record<string, string>;
}

export interface NginxConf {
  port: number;
  limitReqZones?: LimitRequestZone[];
  locations: Location[];
}
