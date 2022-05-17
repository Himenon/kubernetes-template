import { EOL } from "os";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nginxbeautifier = require("nginxbeautifier");

nginxbeautifier.modifyOptions({
  INDENTATION: "  ",
});

/**
 * @see https://github.com/raynigon/vscode-nginx-formatter/blob/master/src/extension.ts#L7-L14
 */
export const formatConf = (text: string): string => {
  let lines: string[] = nginxbeautifier.clean_lines(text);
  lines = nginxbeautifier.join_opening_bracket(lines);
  lines = nginxbeautifier.perform_indentation(lines);
  // Disable perform_alignment due to Bug in Library
  // lines = nginxbeautifier.perform_alignment(lines);
  return lines.join(EOL);
};
