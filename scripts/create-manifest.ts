import { envList } from "@source/definitions/env";
import { Run } from "@source/runner";
import { posix as path } from "path";

const main = async () => {
  const tasksForGen3 = envList.map((env) => {
    const runner = new Run(env, path.join("overlays", env));
    return runner.start();
  });

  await Promise.all([...tasksForGen3]);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
