import { validateEnv } from "@source/definitions/env";
import { Run } from "@source/runner";
import { posix as path } from "path";

const main = async () => {
  const env = validateEnv(process.env.APP_ENV) ? process.env.APP_ENV : "dev";
  const gen3Runner = new Run(env, path.join("overlays", env));
  const tasks = [gen3Runner.start()];
  await Promise.all(tasks);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
