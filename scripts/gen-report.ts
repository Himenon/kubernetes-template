import { Run } from "@source/runner";
import { posix as path } from "path";

const main = async () => {
  const env = "production";
  const gen3Runner = new Run(env, path.join("overlays", env));
  const tasks = [gen3Runner.createReport()];
  await Promise.all(tasks);
};

main().catch((error) => {
  console.error(error);
  console.error("Report generation failed. Please change the reporting parameters or review the settings.");
  process.exit(1);
});
