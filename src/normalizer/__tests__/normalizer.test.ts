import * as Module from "../";

test("CPU", () => {
  expect(Module.normalizeCpuValue("5m")).toEqual(5);
  expect(Module.normalizeCpuValue("50m")).toEqual(50);
  expect(Module.normalizeCpuValue("500m")).toEqual(500);
  expect(Module.normalizeCpuValue("5000m")).toEqual(5000);

  expect(Module.normalizeCpuValue("1")).toEqual(1000);
});

test("Memory", () => {
  expect(Module.normalizeMemoryValue("1Gi")).toEqual(1000);
  expect(Module.normalizeMemoryValue("256Mi")).toEqual(256);
  expect(Module.normalizeMemoryValue("256")).toEqual(256);
});
