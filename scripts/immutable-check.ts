import * as execa from "execa";
import * as parseDiff from "parse-diff";

const { stdout } = execa.sync(`git diff`, { encoding: "utf-8", shell: "bash" });

const diffList = parseDiff(stdout);

const changedFiles = diffList.map((item) => `  * ${item.from}`);

if (changedFiles.length > 0) {
  console.log(`Changed Files:\n${changedFiles.join("\n")}\n`);
  console.log("Please exec 'pnpm run build' and 'git commit'");
  process.exit(1);
} else {
  console.log("OK: No differences were found.");
}
