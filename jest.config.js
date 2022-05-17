/**
 * @type {import("@jest/types").Config.InitialOptions}
 */
module.exports = {
  roots: ["<rootDir>/src"],
  resetMocks: true,
  modulePaths: ["src"],
  testRegex: "/__tests__/.*\\.test\\.(ts|tsx|js)$",
  transformIgnorePatterns: ["[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$", "^.+\\.module\\.(css|sass|scss)$"],
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
};
