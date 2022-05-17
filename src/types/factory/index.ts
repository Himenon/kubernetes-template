interface BaseItem {
  /**
   * kustomization.ymlに含めるか
   */
  includeKustomization?: false;
}

export interface Manifest extends BaseItem {
  /**
   * 拡張子を除いたファイル名（basename）として機能します
   */
  name: string;
  /**
   * YAMLとして生成されます
   */
  value: unknown;
  /**
   * Default v1
   */
  stringifyVersion?: "v1" | "v2";
}

export interface Directory extends BaseItem {
  /**
   * ディレクトリ名として機能します
   */
  name: string;
  /**
   * 下層のファイル・ディレクトリ構造を作成します
   */
  children: Factory;
}

export type Item = Manifest | Directory;

/**
 * ファイル・ディレクトリ構造を提供します
 */
export interface Factory {
  create: () => Item[];
}

export interface RootFactory {
  directoryName: string;
  create: () => Item[];
}
