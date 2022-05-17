export type EnvName = "dev" | "stage" | "qa" | "production";

export interface EnvConfig<T> {
  dev: T;
  stage: T;
  qa: T;
  production: T;
}

export type Environment = keyof EnvConfig<unknown>;

export const envList: EnvName[] = ["dev", "stage", "qa", "production"];

export const validateEnv = (env: unknown): env is EnvName => {
  return envList.includes(env as unknown as EnvName);
};
