export const extractValueAndUnit = (value: string, units: string[]) => {
  const matched = value.match(/^(?<num>\d+(\.\d+)?)(?<unit>\w+)?/);
  if (!matched) {
    throw new Error(`Invalid Value "${value}"`);
  }
  const groups = matched.groups || {};
  return {
    number: parseFloat(groups.num),
    unit: units.includes(groups.unit) ? groups.unit : undefined,
  };
};

/**
 *
 * ミリコアに正規化します
 */
export const normalizeCpuValue = (value: string): number => {
  const { number, unit } = extractValueAndUnit(value, ["m"]);
  if (unit === "m") {
    return number;
  }
  return number * 1000;
};

export const normalizeMemoryValue = (value: string): number => {
  const { number, unit } = extractValueAndUnit(value, ["Mi", "Gi"]);
  if (unit === "Mi" || !unit) {
    return number;
  }
  if (unit === "Gi") {
    return number * 1000;
  }
  return number;
};
